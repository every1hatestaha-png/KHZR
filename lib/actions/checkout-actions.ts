"use server"

import { getCartState, isDatabaseConfigured } from "@/lib/services/cart-service"
import { priceBreakdown } from "@/lib/services/pricing-service"
import { createCheckoutSession, expireCheckoutSession } from "@/lib/services/stripe-service"
import { sessionToken } from "@/lib/services/session-service"
import { resolveDbUser } from "@/lib/services/user-service"
import {
  createOrderRecord,
  nextOrderNumber,
} from "@/lib/services/order-service"
import { applyDiscountCode } from "@/lib/discounts"
import { createCheckoutSchema } from "@/lib/validations/checkout"
import { CHECKOUT_COUNTRIES } from "@/lib/constants"
import { rateLimit } from "@/lib/services/rate-limit"

export type CheckoutActionResult = {
  ok: boolean
  error?: string
  url?: string
}

const toCents = (value: number) => Math.round(value * 100)

export async function createCheckoutSessionAction(
  input: unknown
): Promise<CheckoutActionResult> {
  const parsed = createCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address to continue." }
  }
  const { email, notes, discountCode } = parsed.data

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

  const discount = discountCode ? applyDiscountCode(discountCode) : null
  const pricing = priceBreakdown(cart.subtotal, discount)
  const orderNumber = await nextOrderNumber()
  const user = await resolveDbUser()

  const metadata: Record<string, string> = {
    orderNumber,
    cartToken: token,
    email,
    discountCode: discount?.code ?? "",
    userId: user?.id ?? "",
  }

  const lineItems = cart.lines.map((line) => ({
    name: `${line.name} — ${line.color}`,
    unitAmountCents: toCents(line.unitPrice),
    quantity: line.quantity,
    imageUrl: line.imageUrl,
  }))

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

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
      cartToken: token,
      subtotal: pricing.subtotal,
      shippingTotal: pricing.shipping,
      taxTotal: pricing.tax,
      discountTotal: pricing.discount,
      total: pricing.total,
      shippingMethod: pricing.shipping > 0 ? "Standard Shipping" : "Complimentary Shipping",
      customerNotes: notes,
      providerSessionId: session.id,
      items: cart.lines.map((line) => ({
        variantId: line.variantId,
        productId: line.productId,
        sku: line.sku,
        name: line.name,
        size: line.size,
        color: line.color,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        imageUrl: line.imageUrl,
      })),
    })
  } catch (err) {
    console.error("[checkout] failed to record pending order:", err)
    await expireCheckoutSession(session.id)
    return { ok: false, error: "Checkout could not be started." }
  }

  return { ok: true, url: session.url! }
}
