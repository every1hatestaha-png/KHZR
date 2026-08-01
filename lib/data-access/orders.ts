import "server-only"

import { prisma } from "@/lib/prisma"
import type {
  FulfillmentStatus,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client"

export type OrderAddressDTO = {
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  region: string | null
  postalCode: string
  country: string
}

export type OrderItemDTO = {
  id: string
  sku: string
  name: string
  size: string
  color: string
  unitPrice: number
  quantity: number
  imageUrl: string | null
}

export type OrderSummaryDTO = {
  orderNumber: string
  email: string | null
  phone: string | null
  paymentProvider: string
  fulfillmentStage: string
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  total: number
  createdAt: string
  itemCount: number
}

export type OrderDetailDTO = OrderSummaryDTO & {
  subtotal: number
  shippingTotal: number
  taxTotal: number
  discountTotal: number
  shippingMethod: string | null
  customerNotes: string | null
  internalNotes: string | null
  courier: string | null
  trackingNumber: string | null
  shippingDate: string | null
  expectedDelivery: string | null
  paymentVerifiedAt: string | null
  items: OrderItemDTO[]
  shippingAddress: OrderAddressDTO | null
  billingAddress: OrderAddressDTO | null
}

function toMoney(value: unknown): number {
  return Number(String(value))
}

export function toOrderAddressDTO(
  address: {
    firstName: string
    lastName: string
    line1: string
    line2: string | null
    city: string
    region: string | null
    postalCode: string
    country: string
  } | null
): OrderAddressDTO | null {
  if (!address) return null
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
  }
}

export function toOrderItemDTO(item: OrderItem): OrderItemDTO {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    size: item.size,
    color: item.color,
    unitPrice: toMoney(item.unitPrice),
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  }
}

export function toOrderSummaryDTO(order: Order & { items: OrderItem[] }): OrderSummaryDTO {
  return {
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    paymentProvider: order.paymentProvider,
    fulfillmentStage: order.fulfillmentStage,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    total: toMoney(order.total),
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((n, item) => n + item.quantity, 0),
  }
}

export function toOrderDetailDTO(
  order: Order & {
    items: OrderItem[]
    shippingAddress?: { firstName: string; lastName: string; line1: string; line2: string | null; city: string; region: string | null; postalCode: string; country: string } | null
    billingAddress?: { firstName: string; lastName: string; line1: string; line2: string | null; city: string; region: string | null; postalCode: string; country: string } | null
  }
): OrderDetailDTO {
  return {
    ...toOrderSummaryDTO(order),
    subtotal: toMoney(order.subtotal),
    shippingTotal: toMoney(order.shippingTotal),
    taxTotal: toMoney(order.taxTotal),
    discountTotal: toMoney(order.discountTotal),
    shippingMethod: order.shippingMethod,
    customerNotes: order.customerNotes,
    internalNotes: order.internalNotes,
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    shippingDate: order.shippingDate?.toISOString() ?? null,
    expectedDelivery: order.expectedDelivery?.toISOString() ?? null,
    paymentVerifiedAt: order.paymentVerifiedAt?.toISOString() ?? null,
    items: order.items.map(toOrderItemDTO),
    shippingAddress: toOrderAddressDTO(order.shippingAddress ?? null),
    billingAddress: toOrderAddressDTO(order.billingAddress ?? null),
  }
}

export async function listAccountOrders(userId: string): Promise<OrderDetailDTO[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
    take: 100,
  })
  return orders.map(toOrderDetailDTO)
}

export type AdminOrderFilters = {
  q?: string
  orderNumber?: string
  phone?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  from?: string
  to?: string
  page: number
  perPage: number
}

export type AdminOrderListResult = {
  orders: OrderSummaryDTO[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export async function listAdminOrders(
  filters: AdminOrderFilters
): Promise<AdminOrderListResult> {
  const createdAt = {
    ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
    ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
  }
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    ...(filters.paymentMethod ? { paymentProvider: filters.paymentMethod } : {}),
    ...(filters.orderNumber
      ? { orderNumber: { contains: filters.orderNumber, mode: "insensitive" as const } }
      : {}),
    ...(filters.phone
      ? { phone: { contains: filters.phone, mode: "insensitive" as const } }
      : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
    ...(filters.q
      ? {
          OR: [
            { orderNumber: { contains: filters.q, mode: "insensitive" as const } },
            { email: { contains: filters.q, mode: "insensitive" as const } },
            { phone: { contains: filters.q, mode: "insensitive" as const } },
            { customerNotes: { contains: filters.q, mode: "insensitive" as const } },
            { internalNotes: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders: orders.map(toOrderSummaryDTO),
    total,
    page: filters.page,
    perPage: filters.perPage,
    totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
  }
}

export async function getAdminOrderDetail(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, shippingAddress: true, billingAddress: true },
  })
  return order ? toOrderDetailDTO(order) : null
}

export async function getOrderByProviderSessionId(sessionId: string) {
  const order = await prisma.order.findUnique({
    where: { providerSessionId: sessionId },
    include: { items: true, shippingAddress: true, billingAddress: true },
  })
  return order ? toOrderDetailDTO(order) : null
}

export async function getOrderByOrderNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, shippingAddress: true, billingAddress: true },
  })
  return order ? toOrderDetailDTO(order) : null
}

export async function getAccountOrderDetail(
  userId: string,
  orderNumber: string
) {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    include: { items: true, shippingAddress: true, billingAddress: true },
  })
  return order ? toOrderDetailDTO(order) : null
}

export function toOrderEmailData(
  order: Order & {
    items: OrderItem[]
    shippingAddress?: {
      firstName: string
      lastName: string
      line1: string
      line2: string | null
      city: string
      region: string | null
      postalCode: string
      country: string
    } | null
  }
): import("@/lib/services/email-service").OrderEmailData {
  const shipping = order.shippingAddress ?? null
  return {
    orderNumber: order.orderNumber,
    email: order.email ?? "",
    createdAt: order.createdAt,
    subtotal: toMoney(order.subtotal),
    discount: toMoney(order.discountTotal),
    shipping: toMoney(order.shippingTotal),
    tax: toMoney(order.taxTotal),
    total: toMoney(order.total),
    currency: order.currency,
    lines: order.items.map((item) => ({
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: toMoney(item.unitPrice),
      imageUrl: item.imageUrl,
    })),
    shippingAddress: shipping
      ? {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          region: shipping.region,
          postalCode: shipping.postalCode,
          country: shipping.country,
        }
      : null,
    notes: order.customerNotes,
  }
}
