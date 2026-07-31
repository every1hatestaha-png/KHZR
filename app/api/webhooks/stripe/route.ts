import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { constructWebhookEvent, stripeConfigured } from "@/lib/services/stripe-service"
import {
  attachOrderAddresses,
  decrementInventory,
  findOrderByProviderSession,
  getOrderWithRelations,
  markOrderFailed,
  markOrderPaid,
  orderItemsToStock,
  restoreInventory,
  setFulfillmentStatus,
} from "@/lib/services/order-service"
import type { OrderAddressInput } from "@/lib/services/order-service"
import { clearCart } from "@/lib/services/cart-service"
import { toOrderEmailData } from "@/lib/data-access/orders"
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/lib/services/email-service"

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

async function markOrderRefunded(orderNumber: string) {
  await prisma.order.update({
    where: { orderNumber },
    data: {
      paymentStatus: "REFUNDED",
      status: "REFUNDED",
      refundedAt: new Date(),
    },
  })
}

export async function POST(request: Request) {
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

        await markOrderPaid(orderNumber, paymentIntentId)

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

        await decrementInventory(await orderItemsToStock(order.items))

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
        await markOrderFailed(orderNumber)
        await sendPaymentFailedEmail(toOrderEmailData(order))
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderNumber = session.metadata?.orderNumber
        if (!orderNumber) break
        const order = await findOrderByProviderSession(session.id)
        if (!order || order.paymentStatus !== "PENDING") break
        await markOrderFailed(orderNumber)
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
        await restoreInventory(await orderItemsToStock(order.items))
        await setFulfillmentStatus(order, "CANCELLED")
        await markOrderRefunded(order.orderNumber)
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
