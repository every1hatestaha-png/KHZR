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

export const PAKISTAN_PAYMENT_METHODS = [
  "cash_on_delivery",
  "easypaisa",
  "jazzcash",
  "stripe",
] as const

export const createCheckoutSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default("")
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address.",
    }),
  province: z.string().trim().min(1, "Select your province.").max(80),
  city: z.string().trim().min(1, "Enter your city.").max(100),
  area: z.string().trim().min(1, "Enter your area.").max(120),
  streetAddress: z.string().trim().min(1, "Enter your street address.").max(200),
  houseApartment: z.string().trim().min(1, "Enter your house or apartment.").max(120),
  postalCode: z.string().trim().max(20).optional().default(""),
  paymentMethod: z.enum(PAKISTAN_PAYMENT_METHODS),
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

export const checkoutOrderLookupSchema = z.object({
  order: z.string().min(1).max(40),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
