"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/actions/admin-actions"
import { recalculateProductRating, sanitizeReviewText } from "@/lib/data-access/reviews"
import { resolveDbUser } from "@/lib/services/user-service"
import { reviewIdSchema, reviewReplySchema, reviewSubmitSchema } from "@/lib/validations/reviews"

export type ReviewActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export async function submitReviewAction(input: unknown): Promise<ReviewActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to review purchased products." }
  const parsed = reviewSubmitSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Review could not be read." }
  const data = parsed.data

  const product = await prisma.product.findUnique({ where: { slug: data.productSlug }, select: { id: true, slug: true, name: true } })
  if (!product) return { ok: false, error: "Product not found." }
  const purchased = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: { notIn: ["CANCELLED", "REFUNDED"] },
      paymentStatus: { in: ["PAID", "PENDING"] },
      items: { some: { productId: product.id } },
    },
    select: { id: true },
  })
  if (!purchased) return { ok: false, error: "Only verified purchasers can review this product." }

  try {
    await prisma.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: data.rating,
        title: sanitizeReviewText(data.title),
        body: sanitizeReviewText(data.body),
        isVerified: true,
        isApproved: false,
        status: "PENDING",
        images: {
          create: data.imageUrls.map((url, index) => ({ url, alt: `${product.name} review photo ${index + 1}`, position: index })),
        },
      },
    })
    revalidatePath(`/product/${product.slug}`)
    return { ok: true, message: "Review submitted for moderation." }
  } catch {
    return { ok: false, error: "You have already reviewed this product." }
  }
}

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
  await moderateReview(parsed.data.id, { status: "APPROVED", isApproved: true, approvedBy: "admin" })
  return { ok: true, message: "Review approved." }
}

export async function hideReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  await moderateReview(parsed.data.id, { status: "HIDDEN", isApproved: false })
  return { ok: true, message: "Review hidden." }
}

export async function featureReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  const review = await prisma.review.findUnique({ where: { id: parsed.data.id }, select: { isFeatured: true } })
  if (!review) return { ok: false, error: "Review not found." }
  await moderateReview(parsed.data.id, { isFeatured: !review.isFeatured })
  return { ok: true, message: review.isFeatured ? "Review unfeatured." : "Review featured." }
}

export async function deleteReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Review could not be read." }
  const review = await prisma.review.delete({ where: { id: parsed.data.id }, include: { product: { select: { id: true, slug: true } } } })
  await recalculateProductRating(review.productId)
  revalidatePath(`/product/${review.product.slug}`)
  revalidatePath("/admin/reviews")
  return { ok: true, message: "Review deleted." }
}

export async function replyReviewAction(input: unknown): Promise<ReviewActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = reviewReplySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Reply could not be read." }
  await moderateReview(parsed.data.id, { adminReply: sanitizeReviewText(parsed.data.adminReply) || null })
  return { ok: true, message: "Reply saved." }
}
