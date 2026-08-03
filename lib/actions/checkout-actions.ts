"use server"

import { clearCart, getCartState, isDatabaseConfigured } from "@/lib/services/cart-service"
import { toOrderEmailData } from "@/lib/data-access/orders"
import { sessionToken } from "@/lib/services/session-service"
import { resolveDbUser } from "@/lib/services/user-service"
import {
  createLocalOrderRecord,
  nextOrderNumber,
} from "@/lib/services/order-service"
import { createCheckoutSchema } from "@/lib/validations/checkout"
import { getClientIp, rateLimit, rateLimitKey } from "@/lib/services/rate-limit"
import { assertProductionEnvironment } from "@/lib/env"
import { quoteShipping } from "@/lib/services/shipping-service"
import { prisma } from "@/lib/prisma"
import { quotePromotions, type PromotionQuote } from "@/lib/promotions"
import { sendOrderConfirmationEmail } from "@/lib/services/email-service"
import {
  fingerprintValue,
  logCheckoutEvent,
  maskEmail,
  maskPhone,
  validateCheckoutAddress,
} from "@/lib/checkout-safety"

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

function addressFingerprint(input: {
  province: string
  city: string
  area: string
  streetAddress: string
  houseApartment: string
}) {
  return [input.houseApartment, input.streetAddress, input.area, input.city, input.province]
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, " "))
    .join("|")
}

async function suspiciousOrderNotes(input: {
  phone: string
  email: string
  cartToken: string
  addressKey: string
  ip: string | null
}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const ipMarker = input.ip ? `ip:${fingerprintValue(input.ip)}` : null
  const recent = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
      OR: [
        { phone: input.phone },
        ...(input.email ? [{ email: input.email }] : []),
        { cartToken: input.cartToken },
        ...(ipMarker ? [{ internalNotes: { contains: ipMarker } }] : []),
      ],
    },
    include: { shippingAddress: true },
    take: 20,
  })
  const samePhone = recent.filter((order) => order.phone === input.phone).length
  const sameEmail = input.email ? recent.filter((order) => order.email === input.email).length : 0
  const sameAddress = recent.filter((order) => order.shippingAddress && addressFingerprint({
    province: order.shippingAddress.region ?? "",
    city: order.shippingAddress.city,
    area: order.shippingAddress.area ?? "",
    streetAddress: order.shippingAddress.line1,
    houseApartment: order.shippingAddress.line2 ?? "",
  }) === input.addressKey).length
  const reasons = [
    samePhone >= 3 ? "repeated phone" : null,
    sameEmail >= 3 ? "repeated email" : null,
    sameAddress >= 3 ? "repeated address" : null,
  ].filter(Boolean)
  return reasons.length > 0
    ? `Admin review: ${reasons.join(", ")} in 24h${ipMarker ? `; ${ipMarker}` : ""}`
    : ipMarker
      ? ipMarker
      : null
}

export async function quoteCheckoutShippingAction(input: {
  province: string
  city: string
}): Promise<ShippingQuoteActionResult> {
  try {
    const allowed = await rateLimit("checkout:shipping-quote", 80, 15 * 60 * 1000)
    if (!allowed) return { ok: false, error: "Too many quote attempts. Please try again shortly." }
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
  const allowed = await rateLimit("checkout:promotion-quote", 40, 15 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many promotion attempts. Please try again shortly." }
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your checkout details and try again." }
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
    logCheckoutEvent("environment_invalid", { reason: err instanceof Error ? err.message : "unknown" })
    return { ok: false, error: "Checkout is unavailable right now." }
  }

  const addressError = validateCheckoutAddress({
    firstName,
    lastName,
    city,
    area,
    streetAddress,
    houseApartment,
  })
  if (addressError) return { ok: false, error: addressError }

  const allowedByIp = await rateLimit("checkout", 10, 15 * 60 * 1000)
  const allowedByPhone = await rateLimitKey("checkout:phone", phone.replace(/\D/g, ""), 4, 60 * 60 * 1000)
  const allowedByEmail = email
    ? await rateLimitKey("checkout:email", email, 4, 60 * 60 * 1000)
    : true
  if (!allowedByIp || !allowedByPhone || !allowedByEmail) {
    logCheckoutEvent("rate_limited", { phone: maskPhone(phone), email: maskEmail(email || null) })
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
    logCheckoutEvent("cart_unavailable", { variantId: unavailable[0].variantId, requested: unavailable[0].quantity, available: unavailable[0].available })
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
  const ip = await getClientIp()
  const reviewNotes = await suspiciousOrderNotes({
    phone,
    email: email || "",
    cartToken: token,
    addressKey: addressFingerprint({ province, city, area, streetAddress, houseApartment }),
    ip,
  })

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
      const order = await createLocalOrderRecord({
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
        internalNotes: reviewNotes,
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
      const created = order.orderNumber === orderNumber
      await clearCart(token)
      if (created && order.email) {
        const sent = await sendOrderConfirmationEmail(toOrderEmailData(order))
        if (!sent) logCheckoutEvent("confirmation_email_failed", { orderNumber: order.orderNumber, email: maskEmail(order.email) })
      }
      try {
        await saveCheckoutAddress()
      } catch (err) {
        logCheckoutEvent("save_address_failed", { orderNumber: order.orderNumber, reason: err instanceof Error ? err.message : "unknown" })
      }
      logCheckoutEvent(created ? "order_created" : "duplicate_order_returned", { orderNumber: order.orderNumber, phone: maskPhone(phone), email: maskEmail(email || null) })
      return { ok: true, url: `/checkout/success?order=${order.orderNumber}` }
    } catch (err) {
      logCheckoutEvent("order_failed", { reason: err instanceof Error ? err.message : "unknown", phone: maskPhone(phone), email: maskEmail(email || null) })
      return { ok: false, error: "Checkout could not be completed." }
    }
  }

  return { ok: false, error: "This payment method is unavailable right now." }
}
