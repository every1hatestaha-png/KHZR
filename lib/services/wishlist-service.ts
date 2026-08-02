import "server-only"

import { prisma } from "@/lib/prisma"
import type { ProductSummary } from "@/types"

function toSummary(row: {
  slug: string
  name: string
  subtitle: string | null
  price: { toString(): string }
  media: { url: string }[]
  variants: {
    id: string
    size: string
    color: string
    colorHex: string | null
    stock: number
  }[]
}): ProductSummary {
  const variant =
    row.variants.find((v) => v.stock > 0) ?? row.variants[0]
  return {
    productId: row.slug,
    productSlug: row.slug,
    variantId: variant?.id ?? "",
    name: row.name,
    subtitle: row.subtitle,
    size: variant?.size ?? "One Size",
    color: variant?.color ?? "Noir",
    colorHex: variant?.colorHex ?? null,
    imageUrl: row.media[0]?.url ?? null,
    unitPrice: Number(row.price.toString()),
    available: variant?.stock ?? 0,
  }
}

/** The user's saved pieces as product summaries, newest first. */
export async function getWishlist(userId: string): Promise<ProductSummary[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          media: { orderBy: { position: "asc" }, take: 1 },
          variants: {
            where: { active: true },
            orderBy: { size: "asc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return rows
    .map((r) => r.product)
    .filter((p) => p.status === "ACTIVE")
    .map((p) => toSummary(p))
}

/** Adds or removes a piece (by product slug). Returns the updated list, or null when unknown. */
export async function toggleWishlist(
  userId: string,
  productSlug: string
): Promise<ProductSummary[] | null> {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  })
  if (!product) return null

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId, productId: product.id },
    },
  })

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
  } else {
    await prisma.wishlistItem.create({
      data: { userId, productId: product.id },
    })
  }

  return getWishlist(userId)
}

/** Merges a set of guest-saved slugs into the user's saved pieces. */
export async function mergeWishlist(
  userId: string,
  productSlugs: string[]
): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { slug: { in: productSlugs }, status: "ACTIVE" },
    select: { id: true },
  })
  const uniqueIds = [...new Set(products.map((p) => p.id))]
  if (uniqueIds.length > 0) {
    await prisma.wishlistItem.createMany({
      data: uniqueIds.map((productId) => ({ userId, productId })),
      skipDuplicates: true,
    })
  }
  return getWishlist(userId)
}

export async function clearWishlist(userId: string): Promise<ProductSummary[]> {
  await prisma.wishlistItem.deleteMany({ where: { userId } })
  return []
}
