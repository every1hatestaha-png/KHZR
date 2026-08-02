"use server"

import { clearCart, getCartState, isDatabaseConfigured } from "@/lib/services/cart-service"
import { createCheckoutSession, expireCheckoutSession } from "@/lib/services/stripe-service"
import { sessionToken } from "@/lib/services/session-service"
import { resolveDbUser } from "@/lib/services/user-service"
import {
  createLocalOrderRecord,
  createOrderRecord,
  nextOrderNumber,
} from "@/lib/services/order-service"
import { createCheckoutSchema } from "@/lib/validations/checkout"
import { CHECKOUT_COUNTRIES } from "@/lib/constants"
import { rateLimit } from "@/lib/services/rate-limit"
import { assertProductionEnvironment } from "@/lib/env"
import { quoteShipping } from "@/lib/services/shipping-service"
import { getPaymentProvider } from "@/lib/payments"
import { unavailableMessage } from "@/lib/payments/config"
import type { PaymentProviderName } from "@/lib/payments/types"
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

const WALLET_PAYMENT_METHODS = new Set(["easypaisa", "jazzcash"])

const toCents = (value: number) => Math.round(value * 100)

export async function quoteCheckoutShippingAction(input: {
  province: string
  city: string
  subtotal: number
}): Promise<ShippingQuoteActionResult> {
  try {
    const quote = await quoteShipping(input)
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

  const metadata: Record<string, string> = {
    orderNumber,
    cartToken: token,
    email: email || "",
    phone,
    discountCode: pricing.couponCode ?? "",
    userId: user?.id ?? "",
    paymentMethod,
  }

  const lineItems = cart.lines.map((line) => ({
    name: `${line.name} — ${line.color}`,
    unitAmountCents: toCents(line.unitPrice),
    quantity: line.quantity,
    imageUrl: line.imageUrl,
  }))

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

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

  if (WALLET_PAYMENT_METHODS.has(paymentMethod)) {
    const provider = getPaymentProvider(paymentMethod as PaymentProviderName)
    const payment = await provider.createPayment({
      orderNumber,
      amount: pricing.total,
      currency: "PKR",
      customerName: `${firstName} ${lastName}`,
      customerPhone: phone,
      customerEmail: email || null,
      returnUrl: `${baseUrl}/checkout/success?order=${orderNumber}`,
      callbackUrl: `${baseUrl}/api/payments/${paymentMethod}/callback`,
    })
    if (!payment.ok) {
      return { ok: false, error: payment.configurationError ? unavailableMessage() : payment.error }
    }

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
        paymentStatus: "AWAITING_PAYMENT",
        reserveInventory: false,
        providerTransactionId: payment.providerTransactionId,
        providerReference: payment.providerReference,
        providerResponseCode: payment.providerResponseCode,
        providerResponseMessage: payment.providerResponseMessage,
        paymentInitiatedAt: new Date(),
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
      return { ok: true, url: payment.redirectUrl }
    } catch (err) {
      console.error("[checkout] failed to record wallet order:", err)
      await provider.expireOrCancelPayment({ orderNumber, providerTransactionId: payment.providerTransactionId })
      return { ok: false, error: "Checkout could not be started." }
    }
  }

  if (!email) {
    return { ok: false, error: "Enter an email address to continue with Stripe." }
  }

  let session: Awaited<ReturnType<typeof createCheckoutSession>>
  try {
    session = await createCheckoutSession({
      customerEmail: email,
      lineItems,
      taxLabel: "Duties & Taxes",
      taxCents: toCents(pricing.tax),
      shippingCents: toCents(pricing.shipping),
      shippingLabel:
        pricing.shipping > 0
          ? "Standard Shipping"
          : "Complimentary Shipping",
      metadata,
      clientReferenceId: orderNumber,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      allowedCountries: CHECKOUT_COUNTRIES,
    })
  } catch (err) {
    console.error("[checkout] failed to create Stripe session:", err)
    return { ok: false, error: "Payments are unavailable right now." }
  }

  try {
    await createOrderRecord({
      orderNumber,
      userId: user?.id,
      email,
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
      shippingMethod: pricing.shipping > 0 ? "Standard Shipping" : "Complimentary Shipping",
      customerNotes: notes,
      providerSessionId: session.id,
      paymentProvider: "stripe",
      items: orderItems,
    })
    await saveCheckoutAddress()
  } catch (err) {
    console.error("[checkout] failed to record pending order:", err)
    const expired = await expireCheckoutSession(session.id)
    if (!expired) {
      console.error("[checkout] failed to expire orphaned Stripe session:", session.id)
    }
    return { ok: false, error: "Checkout could not be started." }
  }

  return { ok: true, url: session.url! }
}
