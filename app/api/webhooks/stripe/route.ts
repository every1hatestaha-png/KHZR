import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { constructWebhookEvent, stripeConfigured } from "@/lib/services/stripe-service"
import {
  attachOrderAddresses,
  findOrderByProviderSession,
  getOrderWithRelations,
  markOrderFailedIfPending,
  markOrderPaidAndDecrementInventory,
  orderItemsToStock,
} from "@/lib/services/order-service"
import type { OrderAddressInput } from "@/lib/services/order-service"
import { clearCart } from "@/lib/services/cart-service"
import { toOrderEmailData } from "@/lib/data-access/orders"
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/lib/services/email-service"
import { assertProductionEnvironment } from "@/lib/env"

export const runtime = "nodejs"

function splitName(name: string | null | undefined): {
  firstName: string
  lastName: string
} {
  const parts = (name ?? "Customer").trim().split(/\s+/)
  const lastName = parts.length > 1 ? parts.pop()! : ""
  return { firstName: parts.join(" ") || "Customer", lastName }
}

function toAddressInput(
  address: Stripe.Address | null | undefined,
  name: string | null | undefined
): OrderAddressInput | null {
  if (!address) return null
  return {
    firstName: splitName(name).firstName,
    lastName: splitName(name).lastName,
    line1: address.line1 ?? "",
    line2: address.line2 ?? null,
    city: address.city ?? "",
    region: address.state ?? null,
    postalCode: address.postal_code ?? "",
    country: address.country ?? "",
  }
}

async function orderByPaymentIntent(paymentIntentId: string) {
  return prisma.order.findUnique({
    where: { providerPaymentId: paymentIntentId },
    include: { items: true },
  })
}

async function markOrderRefundedAndRestoreInventory(
  order: NonNullable<Awaited<ReturnType<typeof orderByPaymentIntent>>>
) {
  const entries = await orderItemsToStock(order.items)
  return prisma.$transaction(async (tx) => {
    const refunded = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: "PAID" },
      data: {
        paymentStatus: "REFUNDED",
        status: "REFUNDED",
        fulfillmentStatus: "CANCELLED",
        refundedAt: new Date(),
      },
    })
    if (refunded.count !== 1) return false

    for (const { variantId, quantity } of entries) {
      await tx.productVariant.updateMany({
        where: { id: variantId },
        data: { stock: { increment: quantity } },
      })
    }

    return true
  })
}

export async function POST(request: Request) {
  try {
    assertProductionEnvironment()
  } catch (err) {
    console.error("[webhook] invalid production environment:", err)
    return NextResponse.json({ error: "Invalid environment." }, { status: 500 })
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    )
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 })
  }

  const body = await request.text()
  const event = constructWebhookEvent(body, signature)
  if (!event) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderNumber = session.metadata?.orderNumber
        if (!orderNumber) break

        const order = await findOrderByProviderSession(session.id)
        if (!order || order.paymentStatus !== "PENDING") break // idempotent

        const paymentIntentId = session.payment_intent
          ? String(session.payment_intent)
          : null
        if (!paymentIntentId) break

        const confirmed = await markOrderPaidAndDecrementInventory(
          orderNumber,
          paymentIntentId,
          await orderItemsToStock(order.items)
        )
        if (!confirmed) break

        const shipping = toAddressInput(
          session.collected_information?.shipping_details?.address,
          session.collected_information?.shipping_details?.name
        )
        const billing = toAddressInput(
          session.customer_details?.address,
          session.customer_details?.name
        )
        if (shipping && billing) {
          await attachOrderAddresses(orderNumber, {
            shipping,
            billing,
            userId: session.metadata?.userId || null,
          })
        }

        if (order.cartToken) {
          await clearCart(order.cartToken)
        }

        const full = await getOrderWithRelations(orderNumber)
        if (full) {
          await sendOrderConfirmationEmail(toOrderEmailData(full))
        }
        break
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderNumber = session.metadata?.orderNumber
        if (!orderNumber) break
        const order = await findOrderByProviderSession(session.id)
        if (!order || order.paymentStatus !== "PENDING") break
        const failed = await markOrderFailedIfPending(orderNumber)
        if (failed) {
          await sendPaymentFailedEmail(toOrderEmailData(order))
        }
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderNumber = session.metadata?.orderNumber
        if (!orderNumber) break
        const order = await findOrderByProviderSession(session.id)
        if (!order || order.paymentStatus !== "PENDING") break
        await markOrderFailedIfPending(orderNumber)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent
          ? String(charge.payment_intent)
          : null
        if (!paymentIntentId) break
        const order = await orderByPaymentIntent(paymentIntentId)
        if (!order || order.paymentStatus !== "PAID") break
        await markOrderRefundedAndRestoreInventory(order)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error("[webhook] handler failed:", err)
    return NextResponse.json({ error: "Handler failed." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
