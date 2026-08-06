"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/actions/admin-actions"
import { recalculateProductRating, sanitizeReviewText } from "@/lib/data-access/reviews"
import { reviewIdSchema, reviewReplySchema } from "@/lib/validations/reviews"

export type ReviewActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

async function moderateReview(id: string, data: { status?: "PENDING" | "APPROVED" | "HIDDEN"; isApproved?: boolean; isFeatured?: boolean; adminReply?: string | null; approvedBy?: string | null }) {
  const review = await prisma.review.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === "APPROVED" ? { approvedAt: new Date() } : {}),
    },
    include: { product: { select: { id: true, slug: true } } },
  })
  await recalculateProductRating(review.productId)
  revalidatePath(`/product/${review.product.slug}`)
  revalidatePath("/admin/reviews")
}

export async function approveReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  try {
    await moderateReview(parsed.data.id, { status: "APPROVED", isApproved: true, approvedBy: "admin" })
    return { ok: true, message: "Review approved." }
  } catch {
    return { ok: false, error: "Review could not be approved." }
  }
}

export async function hideReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  try {
    await moderateReview(parsed.data.id, { status: "HIDDEN", isApproved: false })
    return { ok: true, message: "Review hidden." }
  } catch {
    return { ok: false, error: "Review could not be hidden." }
  }
}

export async function featureReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  try {
    const review = await prisma.review.findUnique({ where: { id: parsed.data.id }, select: { isFeatured: true } })
    if (!review) return { ok: false, error: "Review not found." }
    await moderateReview(parsed.data.id, { isFeatured: !review.isFeatured })
    return { ok: true, message: review.isFeatured ? "Review unfeatured." : "Review featured." }
  } catch {
    return { ok: false, error: "Review feature state could not be updated." }
  }
}

export async function deleteReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  try {
    const review = await prisma.review.delete({ where: { id: parsed.data.id }, include: { product: { select: { id: true, slug: true } } } })
    await recalculateProductRating(review.productId)
    revalidatePath(`/product/${review.product.slug}`)
    revalidatePath("/admin/reviews")
    return { ok: true, message: "Review deleted." }
  } catch {
    return { ok: false, error: "Review could not be deleted." }
  }
}

export async function replyReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewReplySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Reply could not be read." }
  try {
    await moderateReview(parsed.data.id, { adminReply: sanitizeReviewText(parsed.data.adminReply) || null })
    return { ok: true, message: "Reply saved." }
  } catch {
    return { ok: false, error: "Reply could not be saved." }
  }
}
