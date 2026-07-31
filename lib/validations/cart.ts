import { z } from "zod"

export const addItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  unitPrice: z.number().finite().nonnegative(),
  quantity: z.number().int().min(1).max(10),
})

export const updateQuantitySchema = z.object({
  lineId: z.string().min(1),
  quantity: z.number().int().min(0).max(10),
})

export const removeItemSchema = z.object({
  lineId: z.string().min(1),
})

export const clearCartSchema = z.object({})
