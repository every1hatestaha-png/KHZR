"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/actions/admin-actions"
import {
  cancelOrder,
  getOrderWithRelations,
  setFulfillmentStatus,
  transitionOrderStatus,
} from "@/lib/services/order-service"
import { refundPayment } from "@/lib/services/stripe-service"
import { toOrderEmailData } from "@/lib/data-access/orders"
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendShippingConfirmationEmail,
} from "@/lib/services/email-service"
import {
  orderFulfillmentUpdateSchema,
  orderStatusUpdateSchema,
} from "@/lib/validations/checkout"

export type OrderActionResult =
  | { ok: true; message?: string; orderNumber: string }
  | { ok: false; error: string }

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLED: "Fulfilled",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
}

async function loadOrderForEmail(orderNumber: string) {
  const order = await getOrderWithRelations(orderNumber)
  return order
}

export async function updateOrderStatusAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = orderStatusUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "The status update could not be read." }
  }
  const { orderNumber, status } = parsed.data

  try {
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { ok: false, error: "Order not found." }

    if (status === "CANCELLED") {
      await cancelOrder(orderNumber)
      if (order.providerPaymentId && order.paymentStatus === "PAID") {
        await refundPayment(order.providerPaymentId)
      }
      revalidatePath("/admin/orders")
      revalidatePath(`/admin/orders/${orderNumber}`)
      return { ok: true, orderNumber, message: "Order cancelled." }
    }

    if (status === "REFUNDED") {
      await transitionOrderStatus(order, "REFUNDED")
      if (order.providerPaymentId && order.paymentStatus === "PAID") {
        await refundPayment(order.providerPaymentId)
      }
      const full = await loadOrderForEmail(orderNumber)
      if (full) {
        await sendOrderStatusEmail(toOrderEmailData(full), "Refunded")
      }
      revalidatePath("/admin/orders")
      revalidatePath(`/admin/orders/${orderNumber}`)
      return { ok: true, orderNumber, message: "Order refunded." }
    }

    const updated = await transitionOrderStatus(order, status)
    if (updated.status === "SHIPPED") {
      const full = await loadOrderForEmail(orderNumber)
      if (full) {
        await sendShippingConfirmationEmail(toOrderEmailData(full))
      }
    } else if (updated.status === "FULFILLED" || updated.status === "DELIVERED") {
      const full = await loadOrderForEmail(orderNumber)
      if (full) {
        await sendOrderStatusEmail(
          toOrderEmailData(full),
          STATUS_LABELS[updated.status] ?? updated.status
        )
      }
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderNumber}`)
    return {
      ok: true,
      orderNumber,
      message: `Order moved to ${STATUS_LABELS[status] ?? status}.`,
    }
  } catch (err) {
    console.error("[admin] order status failed:", err)
    return {
      ok: false,
      error:
        "That transition is not allowed for this order, or the database is unreachable.",
    }
  }
}

export async function updateOrderFulfillmentAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = orderFulfillmentUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "The fulfillment update could not be read." }
  }
  const { orderNumber, fulfillmentStatus } = parsed.data

  try {
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { ok: false, error: "Order not found." }
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      return {
        ok: false,
        error: "Cancelled and refunded orders cannot change fulfillment.",
      }
    }
    await setFulfillmentStatus(order, fulfillmentStatus)
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderNumber}`)
    return { ok: true, orderNumber, message: "Fulfillment updated." }
  } catch {
    return { ok: false, error: "Fulfillment could not be updated." }
  }
}

export async function resendOrderConfirmationAction(
  orderNumber: string
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  try {
    const order = await loadOrderForEmail(orderNumber)
    if (!order) return { ok: false, error: "Order not found." }
    const sent = await sendOrderConfirmationEmail(toOrderEmailData(order))
    if (!sent) {
      return {
        ok: false,
        error: "Email could not be sent — check RESEND_API_KEY.",
      }
    }
    return { ok: true, orderNumber, message: "Confirmation email sent." }
  } catch {
    return { ok: false, error: "Email could not be sent." }
  }
}
