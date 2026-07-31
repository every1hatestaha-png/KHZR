import "server-only"

import Stripe from "stripe"

let _stripe: Stripe | null | undefined

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Lazily-constructed Stripe client. Returns null when the key is unset. */
export function getStripe(): Stripe | null {
  if (!stripeConfigured()) return null
  if (_stripe === undefined) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

export type StripeLineItem = {
  name: string
  unitAmountCents: number
  quantity: number
  imageUrl?: string | null
}

export type CreateCheckoutSessionParams = {
  customerEmail: string
  lineItems: StripeLineItem[]
  taxLabel: string
  taxCents: number
  shippingCents: number
  shippingLabel: string
  metadata: Record<string, string>
  clientReferenceId: string
  successUrl: string
  cancelUrl: string
  idempotencyKey?: string
  allowedCountries: readonly string[]
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  if (!stripe) throw new Error("Stripe is not configured.")

  const lines = params.lineItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: item.unitAmountCents,
      product_data: {
        name: item.name,
        ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
      },
    },
  }))

  if (params.taxCents > 0) {
    lines.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: params.taxCents,
        product_data: { name: params.taxLabel },
      },
    })
  }

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: params.customerEmail,
      client_reference_id: params.clientReferenceId,
      metadata: params.metadata,
      payment_intent_data: {
        metadata: params.metadata,
        capture_method: "automatic",
      },
      line_items: lines,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: params.shippingCents,
              currency: "usd",
            },
            display_name: params.shippingLabel,
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [...params.allowedCountries],
      },
      billing_address_collection: "required",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    },
    params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined
  )
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripe()
  if (!stripe) return null
  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return null
  }
}

export async function expireCheckoutSession(
  sessionId: string
): Promise<boolean> {
  const stripe = getStripe()
  if (!stripe) return false
  try {
    await stripe.checkout.sessions.expire(sessionId)
    return true
  } catch {
    return false
  }
}

export async function refundPayment(
  paymentIntentId: string,
  amountCents?: number
): Promise<Stripe.Refund | null> {
  const stripe = getStripe()
  if (!stripe) return null
  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountCents ? { amount: amountCents } : {}),
    })
  } catch {
    return null
  }
}

export function constructWebhookEvent(
  payload: string,
  signature: string
): Stripe.Event | null {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return null
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch {
    return null
  }
}
