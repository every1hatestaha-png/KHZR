"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/actions/admin-actions"
import {
  cancelOrder,
  getOrderWithRelations,
  markWalletOrderPaidAndDecrementInventory,
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
  adminFulfillmentUpdateSchema,
  adminInternalNotesSchema,
  adminPaymentWorkflowSchema,
  adminShippingUpdateSchema,
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

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
}

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderNumber}`)
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
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
      revalidateOrder(orderNumber)
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
      revalidateOrder(orderNumber)
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

    revalidateOrder(orderNumber)
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
    revalidateOrder(orderNumber)
    return { ok: true, orderNumber, message: "Fulfillment updated." }
  } catch {
    return { ok: false, error: "Fulfillment could not be updated." }
  }
}

export async function updateFulfillmentStageAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = adminFulfillmentUpdateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "The fulfillment update could not be read." }
  const { orderNumber, fulfillmentStage } = parsed.data

  try {
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { ok: false, error: "Order not found." }

    if (fulfillmentStage === "cancelled") {
      await cancelOrder(orderNumber)
      await prisma.order.update({
        where: { orderNumber },
        data: { fulfillmentStage: "cancelled" },
      })
    } else {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          fulfillmentStage,
          ...(fulfillmentStage === "confirmed" ? { status: "CONFIRMED" as const } : {}),
          ...(fulfillmentStage === "packed"
            ? { fulfillmentStatus: "PARTIALLY_FULFILLED" as const }
            : {}),
          ...(fulfillmentStage === "shipped"
            ? { status: "SHIPPED" as const, fulfillmentStatus: "FULFILLED" as const }
            : {}),
          ...(fulfillmentStage === "delivered" ? { status: "DELIVERED" as const } : {}),
          ...(fulfillmentStage === "completed"
            ? { status: "FULFILLED" as const, fulfillmentStatus: "FULFILLED" as const }
            : {}),
        },
      })
    }

    revalidateOrder(orderNumber)
    return {
      ok: true,
      orderNumber,
      message: `Fulfillment moved to ${FULFILLMENT_STAGE_LABELS[fulfillmentStage]}.`,
    }
  } catch (err) {
    console.error("[admin] fulfillment stage failed:", err)
    return { ok: false, error: "Fulfillment could not be updated." }
  }
}

export async function markPaymentVerifiedAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = adminPaymentWorkflowSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "The payment update could not be read." }
  const { orderNumber } = parsed.data

  try {
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return { ok: false, error: "Order not found." }

    if (
      (order.paymentProvider === "easypaisa" || order.paymentProvider === "jazzcash") &&
      order.paymentStatus === "AWAITING_PAYMENT"
    ) {
      const paid = await markWalletOrderPaidAndDecrementInventory({ orderNumber })
      if (!paid) return { ok: false, error: "Payment could not be verified." }
      revalidateOrder(orderNumber)
      return { ok: true, orderNumber, message: "Payment marked paid." }
    }

    await prisma.order.update({
      where: { orderNumber },
      data: { paymentStatus: "PAID", paymentVerifiedAt: new Date() },
    })
    revalidateOrder(orderNumber)
    return { ok: true, orderNumber, message: "Payment marked paid." }
  } catch {
    return { ok: false, error: "Payment could not be updated." }
  }
}

export async function updateShippingDetailsAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = adminShippingUpdateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "The shipping details could not be read." }
  const { orderNumber, courier, trackingNumber, shippingDate, expectedDelivery } = parsed.data

  try {
    await prisma.order.update({
      where: { orderNumber },
      data: {
        courier: courier || null,
        trackingNumber: trackingNumber || null,
        shippingDate: parseDate(shippingDate),
        expectedDelivery: parseDate(expectedDelivery),
      },
    })
    revalidateOrder(orderNumber)
    return { ok: true, orderNumber, message: "Shipping details saved." }
  } catch {
    return { ok: false, error: "Shipping details could not be saved." }
  }
}

export async function updateInternalNotesAction(
  input: unknown
): Promise<OrderActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = adminInternalNotesSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "The internal note could not be read." }
  const { orderNumber, internalNotes } = parsed.data

  try {
    await prisma.order.update({
      where: { orderNumber },
      data: { internalNotes: internalNotes || null },
    })
    revalidateOrder(orderNumber)
    return { ok: true, orderNumber, message: "Internal notes saved." }
  } catch {
    return { ok: false, error: "Internal notes could not be saved." }
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
