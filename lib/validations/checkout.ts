import { z } from "zod"
import { normalizePakistanMobile } from "@/lib/checkout-safety"

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
  "AWAITING_PAYMENT",
  "PAID",
  "FAILED",
  "CANCELLED",
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
] as const

export const CHECKOUT_PAYMENT_METHODS = ["cash_on_delivery"] as const

export const FULFILLMENT_STAGES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const

export const createCheckoutSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid Pakistan mobile number.")
    .max(30)
    .transform((value, ctx) => {
      const normalized = normalizePakistanMobile(value)
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "Enter a valid Pakistan mobile number." })
        return z.NEVER
      }
      return normalized
    }),
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
  paymentMethod: z.enum(CHECKOUT_PAYMENT_METHODS),
  notes: z.string().trim().max(2000).optional().default(""),
  discountCode: z.string().trim().max(40).optional().default(""),
  saveAddress: z.coerce.boolean().optional().default(false),
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
  orderNumber: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(30).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAKISTAN_PAYMENT_METHODS).optional(),
  from: z.string().trim().max(20).optional(),
  to: z.string().trim().max(20).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(5).max(100).default(15),
})

export const checkoutOrderLookupSchema = z.object({
  order: z.string().min(1).max(40),
})

export const adminFulfillmentUpdateSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  fulfillmentStage: z.enum(FULFILLMENT_STAGES),
})

export const adminPaymentWorkflowSchema = z.object({
  orderNumber: z.string().min(1).max(40),
})

export const adminShippingUpdateSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  courier: z.string().trim().max(120).optional().default(""),
  trackingNumber: z.string().trim().max(120).optional().default(""),
  shippingDate: z.string().trim().max(20).optional().default(""),
  expectedDelivery: z.string().trim().max(20).optional().default(""),
})

export const adminInternalNotesSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  internalNotes: z.string().trim().max(4000).optional().default(""),
})

export const adminShippingZoneUpdateSchema = z.object({
  id: z.string().min(1).max(120),
  amount: z.coerce.number().min(0).max(100000),
  freeShippingThreshold: z.coerce.number().min(0).max(10000000),
  active: z.coerce.boolean(),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
