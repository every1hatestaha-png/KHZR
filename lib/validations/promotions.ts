import { z } from "zod"

export const promotionSchema = z.object({
  id: z.string().min(1).max(120).optional(),
  name: z.string().trim().min(1, "Enter a promotion name.").max(160),
  code: z.string().trim().max(80).optional().default(""),
  active: z.coerce.boolean().optional().default(false),
  trigger: z.enum(["COUPON", "AUTOMATIC"]),
  scope: z.enum(["STORE", "PRODUCTS", "COLLECTIONS"]),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  percentage: z.coerce.number().min(0).max(100).optional().default(0),
  amount: z.coerce.number().min(0).max(10000000).optional().default(0),
  startsAt: z.string().trim().max(40).optional().default(""),
  endsAt: z.string().trim().max(40).optional().default(""),
  maxUses: z.coerce.number().int().min(0).max(1000000).optional().default(0),
  usesPerCustomer: z.coerce.number().int().min(0).max(1000000).optional().default(0),
  minimumOrderValue: z.coerce.number().min(0).max(10000000).optional().default(0),
  productSlugs: z.string().trim().max(4000).optional().default(""),
  collectionSlugs: z.string().trim().max(4000).optional().default(""),
}).superRefine((data, ctx) => {
  if (data.trigger === "COUPON" && !data.code) ctx.addIssue({ code: "custom", path: ["code"], message: "Coupon promotions require a code." })
  if (data.trigger === "AUTOMATIC" && data.code) ctx.addIssue({ code: "custom", path: ["code"], message: "Automatic promotions cannot have a code." })
  if (data.discountType === "PERCENTAGE" && data.percentage <= 0) ctx.addIssue({ code: "custom", path: ["percentage"], message: "Enter a percentage above zero." })
  if (data.discountType === "FIXED_AMOUNT" && data.amount <= 0) ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter an amount above zero." })
  if (data.scope === "PRODUCTS" && !data.productSlugs.trim()) ctx.addIssue({ code: "custom", path: ["productSlugs"], message: "Enter product slugs for product-scoped promotions." })
  if (data.scope === "COLLECTIONS" && !data.collectionSlugs.trim()) ctx.addIssue({ code: "custom", path: ["collectionSlugs"], message: "Enter collection slugs for collection-scoped promotions." })
})

export const promotionIdSchema = z.object({ id: z.string().min(1).max(120) })
