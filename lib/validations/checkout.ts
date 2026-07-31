import { z } from "zod"

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export const FULFILLMENT_STATUSES = [
  "UNFULFILLED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
] as const

export const createCheckoutSchema = z.object({
  email: z.string().email("Enter a valid email address.").max(200),
  notes: z.string().trim().max(2000).optional().default(""),
  discountCode: z.string().trim().max(40).optional().default(""),
})

export const orderNumberSchema = z.object({
  orderNumber: z.string().min(1).max(40),
})

export const orderStatusUpdateSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  status: z.enum(ORDER_STATUSES),
})

export const orderFulfillmentUpdateSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  fulfillmentStatus: z.enum(FULFILLMENT_STATUSES),
})

export const adminOrderListParamsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(5).max(100).default(15),
})

export const checkoutSessionIdSchema = z.object({
  sessionId: z.string().min(1).max(300),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
