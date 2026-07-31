import { z } from "zod"

export const toggleWishlistSchema = z.object({
  productSlug: z.string().min(1),
})

export const mergeWishlistSchema = z.object({
  productSlugs: z.array(z.string().min(1)).max(250),
})
