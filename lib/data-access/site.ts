import "server-only"

import { prisma } from "@/lib/prisma"
import { isDatabaseConfigured } from "@/lib/services/cart-service"
import {
  FALLBACK_CAMPAIGNS,
  FALLBACK_FEATURED,
  type FallbackCampaign,
  type FallbackCard,
} from "@/lib/fallback-content"

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
  badge: "NEW" | "LOW_STOCK" | "OUT_OF_STOCK" | null
  defaultVariant: {
    variantId: string
    size: string
    color: string
    colorHex: string | null
    stock: number
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
  stockStatus: string
  media: { url: string }[]
  variants: { id: string; size: string; color: string; colorHex: string | null; stock: number }[]
}): ProductCardDTO {
  const variant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
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
    badge: product.stockStatus as ProductCardDTO["badge"],
    defaultVariant: {
      variantId: variant?.id ?? "",
      size: variant?.size ?? "One Size",
      color: variant?.color ?? "Noir",
      colorHex: variant?.colorHex ?? null,
      stock: variant?.stock ?? 0,
    },
  }
}

export async function getHomeCampaigns(): Promise<CampaignDTO[]> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_CAMPAIGNS.map((c: FallbackCampaign) => ({ ...c }))
  }

  const rows = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    take: 2,
  })
  if (rows.length === 0) {
    return FALLBACK_CAMPAIGNS.map((c: FallbackCampaign) => ({ ...c }))
  }
  return rows.map((c) => ({
    kicker: c.kicker,
    title: c.title,
    subtitle: c.subtitle,
    ctaLabel: c.ctaLabel,
    ctaHref: c.ctaHref,
    imageUrl: c.imageUrl,
  }))
}

export async function getFeaturedProducts(): Promise<ProductCardDTO[]> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_FEATURED.map((c: FallbackCard) => ({
      slug: c.slug,
      name: c.name,
      subtitle: c.subtitle,
      price: Number(c.price),
      compareAtPrice: c.compareAtPrice ? Number(c.compareAtPrice) : null,
      currency: "USD",
      imageUrl: c.imageUrl,
      isNew: c.isNew,
      badge: null,
      defaultVariant: {
        variantId: `fallback-${c.slug}`,
        size: "M",
        color: "Noir",
        colorHex: "#121110",
        stock: 5,
      },
    }))
  }

  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: {
      media: { orderBy: { position: "asc" }, take: 1 },
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
  if (rows.length === 0) {
    return FALLBACK_FEATURED.map((c: FallbackCard) => ({
      slug: c.slug,
      name: c.name,
      subtitle: c.subtitle,
      price: Number(c.price),
      compareAtPrice: c.compareAtPrice ? Number(c.compareAtPrice) : null,
      currency: "USD",
      imageUrl: c.imageUrl,
      isNew: c.isNew,
      badge: null,
      defaultVariant: {
        variantId: `fallback-${c.slug}`,
        size: "M",
        color: "Noir",
        colorHex: "#121110",
        stock: 5,
      },
    }))
  }
  return rows.map((p) => cardDTO(p))
}
