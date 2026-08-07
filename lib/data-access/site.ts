import "server-only"

import { prisma } from "@/lib/prisma"
import { isDatabaseConfigured } from "@/lib/services/cart-service"

export type CampaignDTO = {
  kicker: string | null
  title: string
  subtitle: string | null
  ctaLabel: string | null
  ctaHref: string | null
  imageUrl: string
}

export type ProductCardDTO = {
  slug: string
  name: string
  subtitle: string | null
  price: number
  compareAtPrice: number | null
  currency: string
  imageUrl: string
  isNew: boolean
  averageRating: number
  reviewCount: number
  badge: "NEW" | "LOW_STOCK" | "OUT_OF_STOCK" | null
  collectionSlug: string
  collectionName: string
  defaultVariant: {
    variantId: string
    size: string
    color: string
    colorHex: string | null
    stock: number
  }
}

/** Runs a DB query, returning null on any failure so callers return empty. */
async function safeQuery<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query()
  } catch {
    return null
  }
}

function cardDTO(product: {
  slug: string
  name: string
  subtitle: string | null
  price: { toString(): string }
  compareAtPrice: { toString(): string } | null
  currency: string
  isNew: boolean
  averageRating: { toString(): string }
  reviewCount: number
  stockStatus: string
  media: { url: string }[]
  variants: { id: string; size: string; color: string; colorHex: string | null; stock: number }[]
  collections?: { collection: { slug: string; name: string } }[]
}): ProductCardDTO {
  const variant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
  const collection = product.collections?.[0]?.collection
  return {
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle,
    price: Number(product.price.toString()),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice.toString())
      : null,
    currency: product.currency,
    imageUrl: product.media[0]?.url ?? "",
    isNew: product.isNew,
    averageRating: Number(product.averageRating.toString()),
    reviewCount: product.reviewCount,
    badge: product.stockStatus as ProductCardDTO["badge"],
    collectionSlug: collection?.slug ?? "",
    collectionName: collection?.name ?? "",
    defaultVariant: {
      variantId: variant?.id ?? "",
      size: variant?.size ?? "One Size",
      color: variant?.color ?? "Noir",
      colorHex: variant?.colorHex ?? null,
      stock: variant?.stock ?? 0,
    },
  }
}

export type ProductDetailDTO = {
  slug: string
  name: string
  subtitle: string | null
  description: string
  composition: string
  care: string
  price: number
  compareAtPrice: number | null
  currency: string
  isNew: boolean
  averageRating: number
  reviewCount: number
  badge: "NEW" | "LOW_STOCK" | "OUT_OF_STOCK" | null
  sku: string
  collectionSlug: string
  collectionName: string
  images: string[]
  variants: {
    variantId: string
    size: string
    color: string
    colorHex: string | null
    stock: number
  }[]
}

function detailDTO(row: {
  slug: string
  name: string
  subtitle: string | null
  description: string | null
  composition: string | null
  care: string | null
  price: { toString(): string }
  compareAtPrice: { toString(): string } | null
  currency: string
  isNew: boolean
  averageRating: { toString(): string }
  reviewCount: number
  stockStatus: string
  sku: string | null
  status: string
  media: { url: string }[]
  variants: {
    id: string
    size: string
    color: string
    colorHex: string | null
    stock: number
  }[]
  collections: { collection: { slug: string; name: string } }[]
}): ProductDetailDTO {
  const badge =
    row.stockStatus === "OUT_OF_STOCK"
      ? "OUT_OF_STOCK"
      : row.stockStatus === "LOW_STOCK"
        ? "LOW_STOCK"
        : null
  const collection = row.collections[0]?.collection
  return {
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description ?? "",
    composition: row.composition ?? "",
    care: row.care ?? "",
    price: Number(row.price.toString()),
    compareAtPrice: row.compareAtPrice
      ? Number(row.compareAtPrice.toString())
      : null,
    currency: row.currency,
    isNew: row.isNew,
    averageRating: Number(row.averageRating.toString()),
    reviewCount: row.reviewCount,
    badge,
    sku: row.sku ?? "",
    collectionSlug: collection?.slug ?? "",
    collectionName: collection?.name ?? "",
    images: row.media.map((m) => m.url),
    variants: row.variants.map((v) => ({
      variantId: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
    })),
  }
}

/** A full product for the detail page, or null when not found. */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetailDTO | null> {
  if (!isDatabaseConfigured()) return null

  const row = await safeQuery(() =>
    prisma.product.findUnique({
      where: { slug },
      include: {
        media: { orderBy: { position: "asc" } },
        variants: {
          where: { active: true },
          orderBy: { size: "asc" },
        },
        collections: {
          take: 1,
          include: { collection: { select: { slug: true, name: true } } },
        },
      },
    })
  )

  return row && row.status === "ACTIVE" ? detailDTO(row) : null
}

/** Same-collection pieces, backfilled from the wider catalogue. */
export async function getRelatedProducts(
  slug: string,
  collectionSlug: string,
  limit = 4
): Promise<ProductCardDTO[]> {
  if (!isDatabaseConfigured()) return []

  const selected = await safeQuery(() =>
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: slug },
        collections: { some: { collection: { slug: collectionSlug } } },
      },
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
        variants: {
          where: { active: true },
          select: { id: true, size: true, color: true, colorHex: true, stock: true },
          orderBy: { size: "asc" },
          take: 3,
        },
      },
      orderBy: { sortOrder: "asc" },
      take: limit,
    })
  )

  if (!selected) return []

  if (selected.length < limit) {
    const missing = limit - selected.length
    const backfill = await safeQuery(() =>
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          slug: { not: slug },
          collections: { none: { collection: { slug: collectionSlug } } },
        },
        include: {
          media: { orderBy: { position: "asc" }, take: 1 },
          collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
          variants: {
            where: { active: true },
            select: { id: true, size: true, color: true, colorHex: true, stock: true },
            orderBy: { size: "asc" },
            take: 3,
          },
        },
        orderBy: { sortOrder: "asc" },
        take: missing,
      })
    )
    const combined = backfill ? [...selected, ...backfill] : selected
    return combined.map((p) => cardDTO(p))
  }

  return selected.map((p) => cardDTO(p))
}

export async function getProductsByCollection(slug: string, limit = 24): Promise<ProductCardDTO[]> {
  if (!isDatabaseConfigured()) return []

  const where = slug === "new-arrivals"
    ? { status: "ACTIVE" as const, isNew: true }
    : { status: "ACTIVE" as const, collections: { some: { collection: { slug } } } }

  const products = await safeQuery(() =>
    prisma.product.findMany({
      where,
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
        variants: {
          where: { active: true },
          select: { id: true, size: true, color: true, colorHex: true, stock: true },
          orderBy: { size: "asc" },
          take: 3,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    })
  )

  return products ? products.map((p) => cardDTO(p)) : []
}

export async function getHomeCampaigns(): Promise<CampaignDTO[]> {
  if (!isDatabaseConfigured()) return []

  const rows = await safeQuery(() =>
    prisma.campaign.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      take: 2,
    })
  )
  if (!rows || rows.length === 0) return []
  return rows.map((c) => ({
    kicker: c.kicker,
    title: c.title,
    subtitle: c.subtitle,
    ctaLabel: c.ctaLabel,
    ctaHref: c.ctaHref,
    imageUrl: c.imageUrl,
  }))
}

export async function getHomepageSettingsCampaign(): Promise<CampaignDTO | null> {
  if (!isDatabaseConfigured()) return null
  const row = await safeQuery(() => prisma.storeSettings.findUnique({ where: { id: "store" } }))
  if (!row?.heroImageUrl) return null
  return {
    kicker: row.heroLabel,
    title: row.heroHeading ?? "Eastern dresses, ready now.",
    subtitle: row.heroDescription,
    ctaLabel: row.heroButtonText,
    ctaHref: row.heroButtonLink,
    imageUrl: row.heroImageUrl,
  }
}

export async function getAnnouncementSettings(): Promise<{ active: boolean; text: string }> {
  if (!isDatabaseConfigured()) return { active: false, text: "Coming Soon" }
  const row = await safeQuery(() =>
    prisma.storeSettings.findUnique({
      where: { id: "store" },
      select: { announcementActive: true, announcementText: true },
    })
  )
  return {
    active: row?.announcementActive ?? false,
    text: row?.announcementText || "Coming Soon",
  }
}

export async function getFeaturedProducts(): Promise<ProductCardDTO[]> {
  if (!isDatabaseConfigured()) return []

  const rows = await safeQuery(() =>
    prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
        variants: {
          where: { active: true },
          select: { id: true, size: true, color: true, colorHex: true, stock: true },
          orderBy: { size: "asc" },
          take: 3,
        },
      },
      orderBy: { sortOrder: "asc" },
      take: 8,
    })
  )
  return rows ? rows.map((p) => cardDTO(p)) : []
}

export async function getRecentlyViewedProducts(
  slugs: string[],
  excludeSlug?: string
): Promise<ProductCardDTO[]> {
  const unique = [...new Set(slugs)]
    .filter((slug) => slug && slug !== excludeSlug)
    .slice(0, 10)
  if (unique.length === 0) return []

  if (!isDatabaseConfigured()) return []

  const rows = await safeQuery(() =>
    prisma.product.findMany({
      where: {
        slug: { in: unique },
        status: "ACTIVE",
        variants: { some: { active: true, stock: { gt: 0 } } },
      },
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
        variants: {
          where: { active: true, stock: { gt: 0 } },
          select: { id: true, size: true, color: true, colorHex: true, stock: true },
          orderBy: { size: "asc" },
          take: 3,
        },
      },
      take: unique.length,
    })
  )

  if (!rows) return []
  const cards = rows.map((product) => cardDTO(product))
  return unique
    .map((slug) => cards.find((product) => product.slug === slug))
    .filter((product): product is ProductCardDTO => Boolean(product))
}

export type ProductSearchResult = {
  query: string
  products: ProductCardDTO[]
  error: boolean
}

export function normalizeSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, 80)
}

export async function searchProducts(
  value: string | string[] | undefined,
  limit = 24
): Promise<ProductSearchResult> {
  const query = normalizeSearchQuery(value)
  if (!query) return { query, products: [], error: false }

  if (!isDatabaseConfigured()) {
    return { query, products: [], error: true }
  }

  const rows = await safeQuery(() =>
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        variants: { some: { active: true, stock: { gt: 0 } } },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { subtitle: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { composition: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { variants: { some: { active: true, color: { contains: query, mode: "insensitive" } } } },
          { variants: { some: { active: true, sku: { contains: query, mode: "insensitive" } } } },
          { collections: { some: { collection: { name: { contains: query, mode: "insensitive" } } } } },
          { collections: { some: { collection: { slug: { contains: query, mode: "insensitive" } } } } },
        ],
      },
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        collections: { take: 1, include: { collection: { select: { slug: true, name: true } } } },
        variants: {
          where: { active: true, stock: { gt: 0 } },
          select: { id: true, size: true, color: true, colorHex: true, stock: true },
          orderBy: { size: "asc" },
          take: 3,
        },
      },
      orderBy: [{ isNew: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    })
  )

  if (!rows) return { query, products: [], error: true }
  return { query, products: rows.map((product) => cardDTO(product)), error: false }
}
