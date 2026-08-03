"use server"

import { clearCart, getCartState, isDatabaseConfigured } from "@/lib/services/cart-service"
import { sessionToken } from "@/lib/services/session-service"
import { resolveDbUser } from "@/lib/services/user-service"
import {
  createLocalOrderRecord,
  nextOrderNumber,
} from "@/lib/services/order-service"
import { createCheckoutSchema } from "@/lib/validations/checkout"
import { rateLimit } from "@/lib/services/rate-limit"
import { assertProductionEnvironment } from "@/lib/env"
import { quoteShipping } from "@/lib/services/shipping-service"
import { prisma } from "@/lib/prisma"
import { quotePromotions, type PromotionQuote } from "@/lib/promotions"

export type CheckoutActionResult = {
  ok: boolean
  error?: string
  url?: string
}

export type ShippingQuoteActionResult =
  | { ok: true; zoneName: string; shipping: number; freeShippingThreshold: number; freeShippingApplied: boolean }
  | { ok: false; error: string }

export type CheckoutPromotionQuoteActionResult =
  | { ok: true; quote: PromotionQuote }
  | { ok: false; error: string }

export async function quoteCheckoutShippingAction(input: {
  province: string
  city: string
}): Promise<ShippingQuoteActionResult> {
  try {
    const token = await sessionToken()
    if (!token) return { ok: false, error: "Your bag could not be found." }
    const cart = await getCartState(token)
    if (cart.lines.length === 0) return { ok: false, error: "Your bag is empty." }
    const quote = await quoteShipping({ province: input.province, city: input.city, subtotal: cart.subtotal })
    return {
      ok: true,
      zoneName: quote.zoneName,
      shipping: quote.shipping,
      freeShippingThreshold: quote.freeShippingThreshold,
      freeShippingApplied: quote.freeShippingApplied,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shipping could not be calculated." }
  }
}

export async function quoteCheckoutPromotionAction(input: {
  province: string
  city: string
  couponCode?: string | null
}): Promise<CheckoutPromotionQuoteActionResult> {
  const token = await sessionToken()
  if (!token) return { ok: false, error: "Your bag could not be found." }
  const cart = await getCartState(token)
  if (cart.lines.length === 0) return { ok: false, error: "Your bag is empty." }
  try {
    const user = await resolveDbUser()
    const shipping = await quoteShipping({ province: input.province, city: input.city, subtotal: cart.subtotal })
    const quote = await quotePromotions({
      cart,
      shipping: shipping.shipping,
      couponCode: input.couponCode,
      userId: user?.id,
    })
    return quote.ok ? { ok: true, quote: quote.quote } : quote
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Promotion could not be calculated." }
  }
}

export async function createCheckoutSessionAction(
  input: unknown
): Promise<CheckoutActionResult> {
  const parsed = createCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address to continue." }
  }
  const {
    firstName,
    lastName,
    phone,
    email,
    province,
    city,
    area,
    streetAddress,
    houseApartment,
    postalCode,
    paymentMethod,
    notes,
    discountCode,
    saveAddress,
  } = parsed.data

  try {
    assertProductionEnvironment()
  } catch (err) {
    console.error("[checkout] invalid production environment:", err)
    return { ok: false, error: "Checkout is unavailable right now." }
  }

  const allowed = await rateLimit("checkout", 20, 60 * 60 * 1000)
  if (!allowed) {
    return { ok: false, error: "Too many checkout attempts. Please try again shortly." }
  }

  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Checkout is unavailable right now." }
  }

  const token = await sessionToken()
  if (!token) {
    return { ok: false, error: "Your bag could not be found." }
  }

  const cart = await getCartState(token)
  if (cart.lines.length === 0) {
    return { ok: false, error: "Your bag is empty." }
  }

  const unavailable = cart.lines.filter(
    (line) => line.quantity > line.available
  )
  if (unavailable.length > 0) {
    return {
      ok: false,
      error: `${unavailable[0].name} in ${unavailable[0].size} — ${unavailable[0].color} is no longer available in that quantity.`,
    }
  }

  const user = await resolveDbUser()

  let shippingQuote: Awaited<ReturnType<typeof quoteShipping>>
  try {
    shippingQuote = await quoteShipping({ province, city, subtotal: cart.subtotal })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shipping could not be calculated." }
  }
  const promotionQuote = await quotePromotions({
    cart,
    shipping: shippingQuote.shipping,
    couponCode: discountCode,
    userId: user?.id,
    email: email || null,
  })
  if (!promotionQuote.ok) return { ok: false, error: promotionQuote.error }
  const pricing = promotionQuote.quote
  const orderNumber = await nextOrderNumber()

  const orderItems = cart.lines.map((line) => ({
    variantId: line.variantId,
    productId: line.productId,
    sku: line.sku,
    name: line.name,
    size: line.size,
    color: line.color,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    imageUrl: line.imageUrl,
  }))

  async function saveCheckoutAddress() {
    if (!user || !saveAddress) return
    await prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId: user.id, type: "SHIPPING" } })
      await tx.address.create({
        data: {
          userId: user.id,
          type: "SHIPPING",
          firstName,
          lastName,
          phone,
          line1: streetAddress,
          line2: houseApartment,
          area,
          city,
          region: province,
          postalCode: postalCode || "",
          country: "PK",
          deliveryNotes: notes || null,
          isDefault: count === 0,
        },
      })
    })
  }

  if (paymentMethod === "cash_on_delivery") {
    try {
      await createLocalOrderRecord({
        orderNumber,
        userId: user?.id,
        email: email || null,
        phone,
        cartToken: token,
        subtotal: pricing.subtotal,
        shippingTotal: pricing.shipping,
        shippingZone: shippingQuote.zoneName,
        freeShippingApplied: shippingQuote.freeShippingApplied || pricing.freeShippingApplied,
        taxTotal: pricing.tax,
        discountTotal: pricing.discount,
        promotionId: pricing.promotionId,
        couponCode: pricing.couponCode,
        promotionType: pricing.promotionType,
        promotionCustomerEmail: email || null,
        total: pricing.total,
        shippingMethod:
          pricing.shipping > 0 ? "Pakistan Standard Delivery" : "Complimentary Pakistan Delivery",
        customerNotes: notes,
        paymentProvider: paymentMethod,
        shippingAddress: {
          firstName,
          lastName,
          line1: streetAddress,
          line2: `${houseApartment}, ${area}`,
          city,
          region: province,
          postalCode: postalCode || "",
          country: "PK",
        },
        items: orderItems,
      })
      await saveCheckoutAddress()
      await clearCart(token)
      return { ok: true, url: `/checkout/success?order=${orderNumber}` }
    } catch (err) {
      console.error("[checkout] failed to place Pakistan order:", err)
      return { ok: false, error: "Checkout could not be completed." }
    }
  }

  return { ok: false, error: "This payment method is unavailable right now." }
}
