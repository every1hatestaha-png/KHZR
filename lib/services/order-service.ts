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
} from "@prisma/client"

export type OrderWithItems = Order & { items: OrderItem[] }

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
  email: string
  cartToken: string
  subtotal: number
  shippingTotal: number
  taxTotal: number
  discountTotal: number
  total: number
  shippingMethod: string
  customerNotes?: string | null
  shippingAddress?: OrderAddressInput
  billingAddress?: OrderAddressInput
  providerSessionId: string
  items: OrderLineInput[]
}

const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

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
  CONFIRMED: ["FULFILLED", "CANCELLED", "REFUNDED"],
  FULFILLED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

/** Builds a unique, collision-safe order number and persists the order atomically. */
export async function createOrderRecord(
  input: CreateOrderInput
): Promise<{ order: OrderWithItems; created: boolean }> {
  const existing = await prisma.order.findUnique({
    where: { providerSessionId: input.providerSessionId },
    include: { items: true },
  })
  if (existing) return { order: existing, created: false }

  const orderNumber = input.orderNumber || (await nextOrderNumber())

  try {
    const order = await prisma.$transaction(async (tx) => {
      const shippingAddress = input.shippingAddress
        ? await tx.address.create({
            data: {
              type: "SHIPPING",
              ...input.shippingAddress,
              ...(input.userId ? { userId: input.userId } : {}),
            },
          })
        : null
      const billingAddress = input.billingAddress
        ? await tx.address.create({
            data: {
              type: "BILLING",
              ...input.billingAddress,
              ...(input.userId ? { userId: input.userId } : {}),
            },
          })
        : null
      return tx.order.create({
        data: {
          orderNumber,
          ...(input.userId ? { userId: input.userId } : {}),
          email: input.email,
          currency: "USD",
          subtotal: input.subtotal,
          shippingTotal: input.shippingTotal,
          taxTotal: input.taxTotal,
          discountTotal: input.discountTotal,
          total: input.total,
          shippingMethod: input.shippingMethod,
          cartToken: input.cartToken,
          customerNotes: input.customerNotes || null,
          ...(shippingAddress ? { shippingAddressId: shippingAddress.id } : {}),
          ...(billingAddress ? { billingAddressId: billingAddress.id } : {}),
          providerSessionId: input.providerSessionId,
          paymentProvider: "stripe",
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
      })
    })
    return { order, created: true }
  } catch (err) {
    const retry = await prisma.order.findUnique({
      where: { providerSessionId: input.providerSessionId },
      include: { items: true },
    })
    if (retry) return { order: retry, created: false }
    throw err
  }
}

export async function findOrderByProviderSession(
  sessionId: string
): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { providerSessionId: sessionId },
    include: { items: true },
  })
}

/** Creates and links shipping/billing address rows once Stripe reports them. */
export async function attachOrderAddresses(
  orderNumber: string,
  addresses: {
    shipping: OrderAddressInput
    billing: OrderAddressInput
    userId?: string | null
  }
): Promise<Order> {
  const order = await prisma.order.findUnique({ where: { orderNumber } })
  if (!order) throw new Error("Order not found.")

  return prisma.$transaction(async (tx) => {
    const shippingAddress = await tx.address.create({
      data: {
        type: "SHIPPING",
        ...addresses.shipping,
        ...(addresses.userId ? { userId: addresses.userId } : {}),
      },
    })
    const billingAddress = await tx.address.create({
      data: {
        type: "BILLING",
        ...addresses.billing,
        ...(addresses.userId ? { userId: addresses.userId } : {}),
      },
    })
    return tx.order.update({
      where: { orderNumber },
      data: {
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
      },
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

/** Decrements variant stock, never below zero, atomically. */
export async function decrementInventory(entries: StockEntry[]): Promise<void> {
  const stockEntries = mergeStockEntries(entries)
  if (stockEntries.length === 0) return

  await prisma.$transaction(async (tx) => {
    for (const { variantId, quantity } of stockEntries) {
      const result = await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      })
      if (result.count !== 1) {
        throw new Error(`Insufficient stock for variant ${variantId}.`)
      }
    }
  })
}

export async function markOrderPaidAndDecrementInventory(
  orderNumber: string,
  paymentIntentId: string,
  entries: StockEntry[]
): Promise<boolean> {
  const stockEntries = mergeStockEntries(entries)

  return prisma.$transaction(async (tx) => {
    const paid = await tx.order.updateMany({
      where: { orderNumber, paymentStatus: "PENDING" },
      data: {
        paymentStatus: "PAID",
        providerPaymentId: paymentIntentId,
        status: "CONFIRMED",
      },
    })
    if (paid.count !== 1) return false

    for (const { variantId, quantity } of stockEntries) {
      const decremented = await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      })
      if (decremented.count !== 1) {
        throw new Error(`Insufficient stock for variant ${variantId}.`)
      }
    }

    return true
  })
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

export async function cancelOrder(orderNumber: string): Promise<Order> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  })
  if (!order) throw new Error("Order not found.")

  await prisma.$transaction([
    ...(order.paymentStatus === "PAID"
      ? await orderItemsToStock(order.items).then((entries) =>
          entries.map(({ variantId, quantity }) =>
            prisma.productVariant.updateMany({
              where: { id: variantId },
              data: { stock: { increment: quantity } },
            })
          )
        )
      : []),
    prisma.order.update({
      where: { orderNumber },
      data: {
        status: "CANCELLED",
        fulfillmentStatus: "CANCELLED",
        cancelledAt: new Date(),
        ...(order.paymentStatus === "PAID"
          ? { paymentStatus: "REFUNDED" as PaymentStatus, refundedAt: new Date() }
          : {}),
      },
    }),
  ])

  return prisma.order.findUniqueOrThrow({ where: { orderNumber } })
}

export async function transitionOrderStatus(
  order: Order,
  nextStatus: OrderStatus
): Promise<Order> {
  if (!allowedStatusTransitions[order.status].includes(nextStatus)) {
    throw new Error(
      `Cannot move an order from ${order.status} to ${nextStatus}.`
    )
  }

  const data: Partial<Order> = { status: nextStatus }
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
  }
  if (nextStatus === "REFUNDED") {
    data.paymentStatus = "REFUNDED"
    data.refundedAt = new Date()
  }

  return prisma.order.update({ where: { id: order.id }, data })
}

export async function setFulfillmentStatus(
  order: Order,
  fulfillmentStatus: FulfillmentStatus
): Promise<Order> {
  return prisma.order.update({
    where: { id: order.id },
    data: { fulfillmentStatus },
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
