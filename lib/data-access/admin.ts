import "server-only"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export type AdminStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type AdminStockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER"

export type AdminCollectionDTO = {
  id: string
  slug: string
  name: string
  description: string | null
  imageUrl: string | null
  isFeatured: boolean
  sortOrder: number
  productCount: number
  publishedAt: Date | null
}

export type AdminProductRow = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  sku: string | null
  price: number
  compareAtPrice: number | null
  status: AdminStatus
  stockStatus: AdminStockStatus
  isNew: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  imageUrl: string | null
  totalStock: number
  variantCount: number
  collectionNames: string[]
}

export type AdminProductList = {
  items: AdminProductRow[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type AdminVariantDTO = {
  id: string
  size: string
  color: string
  colorHex: string | null
  sku: string
  priceOverride: number | null
  stock: number
  lowStockAt: number
  active: boolean
}

export type AdminMediaDTO = {
  id: string
  url: string
  publicId: string
  alt: string
  position: number
}

export type AdminProductDetail = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string | null
  composition: string | null
  care: string | null
  price: number
  compareAtPrice: number | null
  currency: string
  status: AdminStatus
  stockStatus: AdminStockStatus
  sku: string | null
  isNew: boolean
  isFeatured: boolean
  sortOrder: number
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
  variants: AdminVariantDTO[]
  media: AdminMediaDTO[]
  collectionIds: string[]
  collectionNames: string[]
}

export type AdminSummaryDTO = {
  products: number
  activeProducts: number
  featured: number
  collections: number
  variants: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
  recentProducts: AdminProductRow[]
}

export type AdminInventoryRow = AdminProductRow & {
  variants: AdminVariantDTO[]
}

type ProductRowShape = Prisma.ProductGetPayload<{
  include: {
    media: { orderBy: { position: "asc" } }
    variants: { where: { active: true }; select: { id: true; stock: true } }
    collections: { include: { collection: { select: { slug: true; name: true } } } }
  }
}>

function toNumber(value: { toString(): string }): number {
  return Number(value.toString())
}

function productRow(row: ProductRowShape): AdminProductRow {
  const variants = row.variants
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    sku: row.sku,
    price: toNumber(row.price),
    compareAtPrice: row.compareAtPrice ? toNumber(row.compareAtPrice) : null,
    status: row.status as AdminStatus,
    stockStatus: row.stockStatus as AdminStockStatus,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    imageUrl: row.media[0]?.url ?? null,
    totalStock: variants.reduce((n, v) => n + v.stock, 0),
    variantCount: variants.length,
    collectionNames: row.collections.map((c) => c.collection.name),
  }
}

const productRowInclude = {
  media: { orderBy: { position: "asc" as const } },
  variants: { where: { active: true as const }, select: { id: true, stock: true } },
  collections: {
    include: { collection: { select: { slug: true, name: true } } },
  },
} satisfies Prisma.ProductInclude

export async function getAdminProducts(input: {
  q?: string
  status?: AdminStatus
  collection?: string
  featured?: "true" | "false"
  page?: number
  perPage?: number
}): Promise<AdminProductList | null> {
  try {
    const page = input.page && input.page > 0 ? input.page : 1
    const perPage = input.perPage && input.perPage >= 5 ? input.perPage : 12

    const where: Prisma.ProductWhereInput = {}
    if (input.q) {
      where.OR = [
        { name: { contains: input.q, mode: "insensitive" } },
        { sku: { contains: input.q, mode: "insensitive" } },
        { slug: { contains: input.q, mode: "insensitive" } },
      ]
    }
    if (input.status) where.status = input.status
    if (input.collection) {
      where.collections = { some: { collection: { slug: input.collection } } }
    }
    if (input.featured === "true") where.isFeatured = true
    if (input.featured === "false") where.isFeatured = false

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productRowInclude,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ])

    return {
      items: items.map(productRow),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    }
  } catch {
    return null
  }
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  try {
    const row = await prisma.product.findUnique({
      where: { id },
      include: {
        media: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
        collections: { include: { collection: { select: { slug: true, name: true } } } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      composition: row.composition,
      care: row.care,
      price: toNumber(row.price),
      compareAtPrice: row.compareAtPrice ? toNumber(row.compareAtPrice) : null,
      currency: row.currency,
      status: row.status as AdminStatus,
      stockStatus: row.stockStatus as AdminStockStatus,
      sku: row.sku,
      isNew: row.isNew,
      isFeatured: row.isFeatured,
      sortOrder: row.sortOrder,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      variants: row.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku: v.sku,
        priceOverride: v.priceOverride ? toNumber(v.priceOverride) : null,
        stock: v.stock,
        lowStockAt: v.lowStockAt,
        active: v.active,
      })),
      media: row.media.map((m) => ({
        id: m.id,
        url: m.url,
        publicId: m.publicId,
        alt: m.alt,
        position: m.position,
      })),
      collectionIds: row.collections.map((c) => c.collectionId),
      collectionNames: row.collections.map((c) => c.collection.name),
    }
  } catch {
    return null
  }
}

export async function getAdminProductBySlug(
  slug: string
): Promise<AdminProductDetail | null> {
  try {
    const row = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!row) return null
    return getAdminProductById(row.id)
  } catch {
    return null
  }
}

export async function getAdminCollections(): Promise<AdminCollectionDTO[] | null> {
  try {
    const rows = await prisma.collection.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      imageUrl: r.imageUrl,
      isFeatured: r.isFeatured,
      sortOrder: r.sortOrder,
      publishedAt: r.publishedAt,
      productCount: r._count.products,
    }))
  } catch {
    return null
  }
}

export async function getAdminSummary(): Promise<AdminSummaryDTO | null> {
  try {
    const [
      products,
      activeProducts,
      featured,
      collections,
      variants,
      lowStock,
      outOfStock,
      recent,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.collection.count(),
      prisma.productVariant.count({ where: { active: true } }),
      prisma.product.count({
        where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      }),
      prisma.product.count({ where: { stockStatus: "OUT_OF_STOCK" } }),
      prisma.product.findMany({
        include: productRowInclude,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    const stockAgg = await prisma.productVariant.aggregate({
      _sum: { stock: true },
      where: { active: true },
    })

    return {
      products,
      activeProducts,
      featured,
      collections,
      variants,
      totalStock: stockAgg._sum.stock ?? 0,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      recentProducts: recent.map(productRow),
    }
  } catch {
    return null
  }
}

export async function getAdminInventory(): Promise<AdminInventoryRow[] | null> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: {
        media: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
        collections: {
          include: { collection: { select: { slug: true, name: true } } },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
    return rows.map((row) => ({
      ...productRow(row),
      variants: row.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku: v.sku,
        priceOverride: v.priceOverride ? toNumber(v.priceOverride) : null,
        stock: v.stock,
        lowStockAt: v.lowStockAt,
        active: v.active,
      })),
    }))
  } catch {
    return null
  }
}
