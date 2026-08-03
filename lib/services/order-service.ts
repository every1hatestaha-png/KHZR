import "server-only"

import { randomInt } from "node:crypto"

import { prisma } from "@/lib/prisma"
import { ORDER_NUMBER_PREFIX } from "@/lib/constants"
import type {
  FulfillmentStatus,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client"

export type OrderWithItems = Order & { items: OrderItem[] }
export type FulfillmentStage = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "completed" | "cancelled"

export type OrderAddressInput = {
  firstName: string
  lastName: string
  line1: string
  line2?: string | null
  city: string
  region?: string | null
  postalCode: string
  country: string
}

export type OrderLineInput = {
  variantId: string | null
  productId: string
  sku: string
  name: string
  size: string
  color: string
  unitPrice: number
  quantity: number
  imageUrl: string | null
}

export type CreateOrderInput = {
  orderNumber: string
  userId?: string | null
  email?: string | null
  phone?: string | null
  cartToken: string
  subtotal: number
  shippingTotal: number
  shippingZone?: string | null
  freeShippingApplied?: boolean
  taxTotal: number
  discountTotal: number
  promotionId?: string | null
  couponCode?: string | null
  promotionType?: string | null
  total: number
  shippingMethod: string
  customerNotes?: string | null
  internalNotes?: string | null
  shippingAddress?: OrderAddressInput
  billingAddress?: OrderAddressInput
  providerSessionId: string
  paymentProvider?: string
  promotionCustomerEmail?: string | null
  items: OrderLineInput[]
}

export type CreateLocalOrderInput = Omit<
  CreateOrderInput,
  "providerSessionId"
> & {
  shippingAddress: OrderAddressInput
  billingAddress?: OrderAddressInput
  reserveInventory?: boolean
  paymentStatus?: PaymentStatus
  providerTransactionId?: string | null
  providerReference?: string | null
  providerResponseCode?: string | null
  providerResponseMessage?: string | null
  paymentInitiatedAt?: Date | null
}

const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const DUPLICATE_ORDER_WINDOW_MS = 15 * 60 * 1000

export function generateOrderNumber(): string {
  let suffix = ""
  for (let i = 0; i < 8; i += 1) {
    suffix += ORDER_NUMBER_ALPHABET[randomInt(ORDER_NUMBER_ALPHABET.length)]
  }
  return `${ORDER_NUMBER_PREFIX}-${suffix}`
}

export async function nextOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderNumber()
    const existing = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  return generateOrderNumber()
}

export const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["FULFILLED", "SHIPPED", "CANCELLED", "REFUNDED"],
  FULFILLED: ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

export const allowedFulfillmentStages: Record<FulfillmentStage, FulfillmentStage[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
}

const allowedFulfillmentStatusTransitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  UNFULFILLED: ["PARTIALLY_FULFILLED", "FULFILLED"],
  PARTIALLY_FULFILLED: ["FULFILLED"],
  FULFILLED: [],
  CANCELLED: [],
}

function logOrderEvent(event: string, data: Record<string, unknown>) {
  console.info(JSON.stringify({ scope: "order", event, ...data }))
}

function isFulfillmentStage(value: string): value is FulfillmentStage {
  return Object.prototype.hasOwnProperty.call(allowedFulfillmentStages, value)
}

function assertActiveOrder(order: Order) {
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    throw new Error("Terminal orders cannot be changed.")
  }
}

function canFulfillWithPayment(order: Order) {
  if (order.paymentProvider === "cash_on_delivery") return order.paymentStatus === "PENDING" || order.paymentStatus === "PAID"
  return order.paymentStatus === "PAID"
}

function sameMoney(left: unknown, right: number) {
  return Number(left) === right
}

function sameOrderLines(left: OrderItem[], right: OrderLineInput[]) {
  if (left.length !== right.length) return false
  const key = (item: { variantId: string | null; productId: string; quantity: number; unitPrice: unknown }) =>
    `${item.variantId ?? ""}:${item.productId}:${item.quantity}:${Number(item.unitPrice)}`
  const leftKeys = left.map(key).sort()
  const rightKeys = right.map(key).sort()
  return leftKeys.every((value, index) => value === rightKeys[index])
}

async function findDuplicateLocalOrder(
  tx: Prisma.TransactionClient,
  input: CreateLocalOrderInput
): Promise<OrderWithItems | null> {
  const recentOrders = await tx.order.findMany({
    where: {
      cartToken: input.cartToken,
      paymentProvider: input.paymentProvider ?? "cash_on_delivery",
      createdAt: { gte: new Date(Date.now() - DUPLICATE_ORDER_WINDOW_MS) },
      status: { not: "CANCELLED" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
  return recentOrders.find((order) =>
    sameMoney(order.subtotal, input.subtotal) &&
    sameMoney(order.shippingTotal, input.shippingTotal) &&
    sameMoney(order.taxTotal, input.taxTotal) &&
    sameMoney(order.discountTotal, input.discountTotal) &&
    sameMoney(order.total, input.total) &&
    sameOrderLines(order.items, input.items)
  ) ?? null
}

export async function createLocalOrderRecord(
  input: CreateLocalOrderInput
): Promise<OrderWithItems> {
  const orderNumber = input.orderNumber || (await nextOrderNumber())

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${input.cartToken}))`
    const duplicate = await findDuplicateLocalOrder(tx, input)
    if (duplicate) {
      console.info(JSON.stringify({ scope: "checkout", event: "duplicate_order_detected", orderNumber: duplicate.orderNumber }))
      return duplicate
    }

    const shippingAddress = await tx.address.create({
      data: {
        type: "SHIPPING",
        ...input.shippingAddress,
        ...(input.userId ? { userId: input.userId } : {}),
      },
    })
    const billingAddress = input.billingAddress
      ? await tx.address.create({
          data: {
            type: "BILLING",
            ...input.billingAddress,
            ...(input.userId ? { userId: input.userId } : {}),
          },
        })
      : shippingAddress

    if (input.reserveInventory ?? true) {
      const stockEntries = mergeStockEntries(await orderItemsToStock(input.items))
      for (const { variantId, quantity } of stockEntries) {
        const decremented = await tx.productVariant.updateMany({
          where: { id: variantId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        })
        if (decremented.count !== 1) {
          throw new Error(`Insufficient stock for variant ${variantId}.`)
        }
      }
    }

    return tx.order.create({
      data: {
        orderNumber,
        ...(input.userId ? { userId: input.userId } : {}),
        email: input.email || null,
        phone: input.phone || null,
        status: input.paymentStatus === "AWAITING_PAYMENT" ? "PENDING" : "CONFIRMED",
        paymentStatus: input.paymentStatus ?? "PENDING",
        currency: "PKR",
        subtotal: input.subtotal,
        shippingTotal: input.shippingTotal,
        shippingZone: input.shippingZone || null,
        freeShippingApplied: input.freeShippingApplied ?? false,
        taxTotal: input.taxTotal,
        discountTotal: input.discountTotal,
        promotionId: input.promotionId || null,
        couponCode: input.couponCode || null,
        promotionType: input.promotionType || null,
        total: input.total,
        shippingMethod: input.shippingMethod,
        cartToken: input.cartToken,
        customerNotes: input.customerNotes || null,
        internalNotes: input.internalNotes || null,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        paymentProvider: input.paymentProvider ?? "cash_on_delivery",
        providerTransactionId: input.providerTransactionId || null,
        providerReference: input.providerReference || null,
        providerResponseCode: input.providerResponseCode || null,
        providerResponseMessage: input.providerResponseMessage || null,
        paymentInitiatedAt: input.paymentInitiatedAt || null,
        items: {
          create: input.items.map((item) => ({
            ...(item.variantId ? { variantId: item.variantId } : {}),
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            size: item.size,
            color: item.color,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
        },
      },
      include: { items: true },
    }).then(async (order) => {
      if (input.promotionId && input.discountTotal > 0) {
        const promotion = await tx.promotion.findUnique({
          where: { id: input.promotionId },
          select: { maxUses: true },
        })
        const usage = await tx.promotion.updateMany({
          where: {
            id: input.promotionId,
            ...(promotion?.maxUses === null || promotion?.maxUses === undefined
              ? {}
              : { usageCount: { lt: promotion.maxUses } }),
          },
          data: { usageCount: { increment: 1 } },
        })
        if (usage.count !== 1) throw new Error("Promotion usage limit exceeded.")
        await tx.promotionRedemption.create({
          data: {
            promotionId: input.promotionId,
            orderId: order.id,
            userId: input.userId || null,
            email: input.promotionCustomerEmail?.toLowerCase() || input.email?.toLowerCase() || null,
            couponCode: input.couponCode || null,
            amount: input.discountTotal,
          },
        })
      }
      return order
    })
  })
}

export type StockEntry = { variantId: string; quantity: number }

function mergeStockEntries(entries: StockEntry[]): StockEntry[] {
  const quantities = new Map<string, number>()
  for (const { variantId, quantity } of entries) {
    quantities.set(variantId, (quantities.get(variantId) ?? 0) + quantity)
  }
  return [...quantities.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }))
}

export async function orderItemsToStock(
  items: Array<{ variantId: string | null; quantity: number }>
): Promise<StockEntry[]> {
  return items
    .filter((item) => item.variantId)
    .map((item) => ({ variantId: item.variantId!, quantity: item.quantity }))
}

/** Restores variant stock after a failed or cancelled order. */
export async function restoreInventory(entries: StockEntry[]): Promise<void> {
  if (entries.length === 0) return
  await prisma.$transaction(
    entries.map(({ variantId, quantity }) =>
      prisma.productVariant.updateMany({
        where: { id: variantId },
        data: { stock: { increment: quantity } },
      })
    )
  )
}

export async function markOrderFailedIfPending(
  orderNumber: string
): Promise<boolean> {
  const result = await prisma.order.updateMany({
    where: { orderNumber, paymentStatus: "PENDING" },
    data: { paymentStatus: "FAILED" },
  })
  return result.count === 1
}

export async function cancelOrder(orderNumber: string, reason?: string | null): Promise<Order> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  })
  if (!order) throw new Error("Order not found.")
  if (order.status === "CANCELLED" || order.status === "REFUNDED") return order
  if (order.status === "DELIVERED") throw new Error("Delivered orders cannot be cancelled.")
  if (!allowedStatusTransitions[order.status].includes("CANCELLED")) throw new Error("Order cannot be cancelled from this state.")

  const shouldRestoreInventory =
    order.paymentStatus === "PAID" || order.paymentProvider === "cash_on_delivery"

  return prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.updateMany({
      where: { id: order.id, status: { notIn: ["CANCELLED", "REFUNDED"] } },
      data: {
        status: "CANCELLED",
        fulfillmentStatus: "CANCELLED",
        fulfillmentStage: "cancelled",
        cancelledAt: new Date(),
        internalNotes: [order.internalNotes, reason ? `Cancellation reason: ${reason}` : null].filter(Boolean).join("\n") || null,
        ...(order.paymentStatus === "PAID"
          ? { paymentStatus: "REFUNDED" as PaymentStatus, refundedAt: new Date() }
          : {}),
      },
    })
    if (cancelled.count !== 1) return order

    if (shouldRestoreInventory) {
      const entries = await orderItemsToStock(order.items)
      for (const { variantId, quantity } of entries) {
        await tx.productVariant.updateMany({
          where: { id: variantId },
          data: { stock: { increment: quantity } },
        })
      }
    }

    const updated = await tx.order.findUniqueOrThrow({ where: { orderNumber } })
    logOrderEvent("cancelled", { orderNumber, previousStatus: order.status, newStatus: updated.status, result: "success" })
    return updated
  })
}

export async function transitionOrderStatus(
  order: Order,
  nextStatus: OrderStatus
): Promise<Order> {
  if (order.status === nextStatus) return order
  if (!allowedStatusTransitions[order.status].includes(nextStatus)) {
    throw new Error(
      `Cannot move an order from ${order.status} to ${nextStatus}.`
    )
  }

  const data: Partial<Order> = { status: nextStatus }
  if (["FULFILLED", "SHIPPED", "DELIVERED"].includes(nextStatus) && !canFulfillWithPayment(order)) {
    throw new Error("Payment must be collected before this fulfillment transition.")
  }
  if (nextStatus === "CANCELLED") {
    data.cancelledAt = new Date()
    data.fulfillmentStatus = "CANCELLED"
    if (order.paymentStatus === "PAID") {
      data.paymentStatus = "REFUNDED"
      data.refundedAt = new Date()
    }
  }
  if (nextStatus === "FULFILLED") {
    data.fulfillmentStatus = "FULFILLED"
    data.fulfillmentStage = "completed"
  }
  if (nextStatus === "SHIPPED") {
    data.fulfillmentStatus = "FULFILLED"
    data.fulfillmentStage = "shipped"
  }
  if (nextStatus === "DELIVERED") {
    data.fulfillmentStatus = "FULFILLED"
    data.fulfillmentStage = "delivered"
  }
  if (nextStatus === "REFUNDED") {
    if (order.paymentStatus !== "PAID") throw new Error("Only paid orders can be refunded.")
    data.paymentStatus = "REFUNDED"
    data.refundedAt = new Date()
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data })
  logOrderEvent("status_changed", { orderNumber: order.orderNumber, previousStatus: order.status, newStatus: updated.status, result: "success" })
  return updated
}

export async function setFulfillmentStatus(
  order: Order,
  fulfillmentStatus: FulfillmentStatus
): Promise<Order> {
  assertActiveOrder(order)
  if (order.fulfillmentStatus === fulfillmentStatus) return order
  if (fulfillmentStatus === "CANCELLED") throw new Error("Cancel the order instead of only cancelling fulfillment.")
  if (order.status === "DELIVERED") throw new Error("Delivered orders cannot move backward in fulfillment.")
  if (!allowedFulfillmentStatusTransitions[order.fulfillmentStatus].includes(fulfillmentStatus)) {
    throw new Error(`Cannot move fulfillment from ${order.fulfillmentStatus} to ${fulfillmentStatus}.`)
  }
  if (fulfillmentStatus !== "UNFULFILLED" && !canFulfillWithPayment(order)) {
    throw new Error("Payment must be collected before this fulfillment update.")
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { fulfillmentStatus },
  })
  logOrderEvent("fulfillment_status_changed", { orderNumber: order.orderNumber, previousStatus: order.fulfillmentStatus, newStatus: updated.fulfillmentStatus, result: "success" })
  return updated
}

export async function transitionFulfillmentStage(order: Order, nextStage: FulfillmentStage): Promise<Order> {
  assertActiveOrder(order)
  if (!isFulfillmentStage(order.fulfillmentStage)) throw new Error("Current fulfillment stage is invalid.")
  if (order.fulfillmentStage === nextStage) return order
  if (!allowedFulfillmentStages[order.fulfillmentStage].includes(nextStage)) {
    throw new Error(`Cannot move fulfillment from ${order.fulfillmentStage} to ${nextStage}.`)
  }
  if (["packed", "shipped", "delivered", "completed"].includes(nextStage) && !canFulfillWithPayment(order)) {
    throw new Error("Payment must be collected before this fulfillment transition.")
  }

  const data: Prisma.OrderUpdateInput = { fulfillmentStage: nextStage }
  if (nextStage === "confirmed") data.status = "CONFIRMED"
  if (nextStage === "packed") data.fulfillmentStatus = "PARTIALLY_FULFILLED"
  if (nextStage === "shipped") {
    data.status = "SHIPPED"
    data.fulfillmentStatus = "FULFILLED"
  }
  if (nextStage === "delivered") {
    data.status = "DELIVERED"
    data.fulfillmentStatus = "FULFILLED"
  }
  if (nextStage === "completed") {
    data.fulfillmentStatus = "FULFILLED"
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data })
  logOrderEvent("fulfillment_stage_changed", { orderNumber: order.orderNumber, previousStatus: order.fulfillmentStage, newStatus: updated.fulfillmentStage, result: "success" })
  return updated
}

export async function markCodPaymentCollected(orderNumber: string): Promise<Order | null> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { orderNumber } })
    if (!order) return null
    assertActiveOrder(order)
    if (order.paymentProvider !== "cash_on_delivery") throw new Error("Only COD payment collection is supported here.")
    if (order.paymentStatus === "PAID") return order
    if (order.paymentStatus !== "PENDING") throw new Error("Payment cannot be collected from this state.")

    const updated = await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", paymentVerifiedAt: new Date() },
    })
    logOrderEvent("payment_collected", { orderNumber, previousStatus: order.paymentStatus, newStatus: updated.paymentStatus, result: "success" })
    return updated
  })
}

export async function getOrderWithRelations(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })
}
