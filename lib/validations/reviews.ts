import { z } from "zod"

const imageUrls = z
  .string()
  .trim()
  .max(3000)
  .optional()
  .default("")
  .transform((value) =>
    value
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean)
      .slice(0, 5)
  )
  .refine(
    (urls) => urls.every((url) => z.string().url().safeParse(url).success),
    "Enter valid photo URLs."
  )

export const reviewSubmitSchema = z.object({
  productSlug: z.string().min(1).max(160),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(1, "Enter a review title.").max(120),
  body: z.string().trim().min(10, "Write at least 10 characters.").max(3000),
  imageUrls,
})

export const reviewIdSchema = z.object({
  id: z.string().min(1).max(120),
})

export const reviewReplySchema = z.object({
  id: z.string().min(1).max(120),
  adminReply: z.string().trim().max(2000).optional().default(""),
})
