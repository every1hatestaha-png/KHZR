import "server-only"

import { prisma } from "@/lib/prisma"

export type PublicReviewDTO = {
  id: string
  rating: number
  title: string
  body: string
  isVerified: boolean
  isFeatured: boolean
  helpfulCount: number
  createdAt: string
  authorName: string
  adminReply: string | null
  images: { url: string; alt: string | null }[]
}

export type ReviewSummaryDTO = {
  averageRating: number
  reviewCount: number
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>
  gallery: { url: string; alt: string | null }[]
  reviews: PublicReviewDTO[]
}

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").trim()
}

export function sanitizeReviewText(value: string) {
  return cleanText(value).replace(/[\u0000-\u001f\u007f]/g, "")
}

export async function getProductReviewSummary(productSlug: string): Promise<ReviewSummaryDTO> {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true, averageRating: true, reviewCount: true },
  })
  if (!product) return emptySummary()

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, status: "APPROVED", isApproved: true },
    include: { user: true, images: { orderBy: { position: "asc" } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 100,
  })
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  for (const review of reviews) breakdown[review.rating as 1 | 2 | 3 | 4 | 5] += 1
  const gallery = reviews.flatMap((review) => review.images.map((image) => ({ url: image.url, alt: image.alt }))).slice(0, 12)
  return {
    averageRating: Number(product.averageRating),
    reviewCount: product.reviewCount,
    breakdown,
    gallery,
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: cleanText(review.title),
      body: cleanText(review.body),
      isVerified: review.isVerified,
      isFeatured: review.isFeatured,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt.toISOString(),
      authorName: [review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") || "KHZR customer",
      adminReply: cleanText(review.adminReply) || null,
      images: review.images.map((image) => ({ url: image.url, alt: image.alt })),
    })),
  }
}

export async function recalculateProductRating(productId: string) {
  const stats = await prisma.review.aggregate({
    where: { productId, status: "APPROVED", isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })
  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: Number((stats._avg.rating ?? 0).toFixed(2)),
      reviewCount: stats._count.rating,
    },
  })
}

export async function listAdminReviews() {
  return prisma.review.findMany({
    include: { product: true, user: true, images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
}

function emptySummary(): ReviewSummaryDTO {
  return { averageRating: 0, reviewCount: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, gallery: [], reviews: [] }
}
