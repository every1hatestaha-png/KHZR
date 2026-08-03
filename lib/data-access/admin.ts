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
  todayOrders: number
  revenue: number
  pendingOrders: number
  codOrders: number
  paidOrders: number
  recentProducts: AdminProductRow[]
  recentCustomers: AdminCustomerRow[]
  recentOrders: { orderNumber: string; email: string | null; phone: string | null; total: number; createdAt: Date }[]
  bestSellers: { productId: string; name: string; quantity: number }[]
}

export type AdminInventoryRow = AdminProductRow & {
  variants: AdminVariantDTO[]
}

export type AdminCustomerRow = {
  id: string
  clerkId: string
  email: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  newsletter: boolean
  createdAt: Date
  updatedAt: Date
  orderCount: number
  addressCount: number
  totalSpend: number
  lastOrderAt: Date | null
}

export type AdminCustomerList = {
  items: AdminCustomerRow[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type AdminStoreSettings = {
  storeName: string
  ownerNotificationEmail: string
  customerSupportEmail: string
  instagramUrl: string
  facebookUrl: string
  contactDetails: string
  returnPolicyText: string
  shippingPolicyText: string
  footerLinks: string
  announcementText: string
  announcementActive: boolean
  heroImageUrl: string
  heroLabel: string
  heroHeading: string
  heroDescription: string
  heroButtonText: string
  heroButtonLink: string
  homepageCategoryLinks: string
}

export type AdminMediaAsset = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  source: string
  createdAt: Date
}

export type AdminCustomerAddress = {
  id: string
  type: string
  firstName: string
  lastName: string
  phone: string | null
  line1: string
  line2: string | null
  area: string | null
  city: string
  region: string | null
  postalCode: string
  country: string
  deliveryNotes: string | null
  isDefault: boolean
}

export type AdminCustomerOrder = {
  orderNumber: string
  createdAt: Date
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  currency: string
  total: number
  itemCount: number
}

export type AdminCustomerDetail = AdminCustomerRow & {
  addresses: AdminCustomerAddress[]
  orders: AdminCustomerOrder[]
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [
      products,
      activeProducts,
      featured,
      collections,
      variants,
      lowStock,
      outOfStock,
      recent,
      todayOrders,
      revenue,
      pendingOrders,
      codOrders,
      paidOrders,
      recentCustomers,
      recentOrders,
      bestSellers,
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
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { paymentProvider: "cash_on_delivery" } }),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
      prisma.user.findMany({
        include: {
          _count: { select: { orders: true, addresses: true } },
          orders: { select: { total: true, createdAt: true }, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        select: { orderNumber: true, email: true, phone: true, total: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
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
      todayOrders,
      revenue: revenue._sum.total ? toNumber(revenue._sum.total) : 0,
      pendingOrders,
      codOrders,
      paidOrders,
      recentProducts: recent.map(productRow),
      recentCustomers: recentCustomers.map(customerRow),
      recentOrders: recentOrders.map((order) => ({
        orderNumber: order.orderNumber,
        email: order.email,
        phone: order.phone,
        total: toNumber(order.total),
        createdAt: order.createdAt,
      })),
      bestSellers: bestSellers.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item._sum.quantity ?? 0,
      })),
    }
  } catch {
    return null
  }
}

function jsonText(value: unknown) {
  return value == null ? "" : JSON.stringify(value, null, 2)
}

export async function getAdminStoreSettings(): Promise<AdminStoreSettings> {
  const row = await prisma.storeSettings.findUnique({ where: { id: "store" } })
  return {
    storeName: row?.storeName ?? "KHZR",
    ownerNotificationEmail: row?.ownerNotificationEmail ?? "",
    customerSupportEmail: row?.customerSupportEmail ?? "",
    instagramUrl: row?.instagramUrl ?? "",
    facebookUrl: row?.facebookUrl ?? "",
    contactDetails: row?.contactDetails ?? "",
    returnPolicyText: row?.returnPolicyText ?? "",
    shippingPolicyText: row?.shippingPolicyText ?? "",
    footerLinks: jsonText(row?.footerLinks),
    announcementText: row?.announcementText ?? "",
    announcementActive: row?.announcementActive ?? false,
    heroImageUrl: row?.heroImageUrl ?? "",
    heroLabel: row?.heroLabel ?? "",
    heroHeading: row?.heroHeading ?? "",
    heroDescription: row?.heroDescription ?? "",
    heroButtonText: row?.heroButtonText ?? "",
    heroButtonLink: row?.heroButtonLink ?? "",
    homepageCategoryLinks: jsonText(row?.homepageCategoryLinks),
  }
}

export async function getAdminMediaAssets(q?: string): Promise<AdminMediaAsset[]> {
  return prisma.mediaAsset.findMany({
    where: q
      ? {
          OR: [
            { url: { contains: q, mode: "insensitive" } },
            { alt: { contains: q, mode: "insensitive" } },
            { publicId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  })
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

function customerNameParts(customer: { firstName: string | null; lastName: string | null }) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ")
}

function customerRow(
  row: Prisma.UserGetPayload<{
    include: {
      _count: { select: { orders: true; addresses: true } }
      orders: { select: { total: true; createdAt: true } }
    }
  }>
): AdminCustomerRow {
  return {
    id: row.id,
    clerkId: row.clerkId,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    role: row.role,
    newsletter: row.newsletter,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    orderCount: row._count.orders,
    addressCount: row._count.addresses,
    totalSpend: row.orders.reduce((sum, order) => sum + toNumber(order.total), 0),
    lastOrderAt: row.orders[0]?.createdAt ?? null,
  }
}

export async function getAdminCustomers(input: {
  q?: string
  newsletter?: "true" | "false"
  page?: number
  perPage?: number
}): Promise<AdminCustomerList> {
  const page = input.page && input.page > 0 ? input.page : 1
  const perPage = input.perPage && input.perPage >= 5 ? input.perPage : 15
  const q = input.q?.trim()
  const where: Prisma.UserWhereInput = {
    ...(input.newsletter === "true" ? { newsletter: true } : {}),
    ...(input.newsletter === "false" ? { newsletter: false } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { clerkId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { orders: true, addresses: true } },
        orders: {
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  return {
    items: items.map(customerRow),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }
}

export async function getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail | null> {
  const row = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true, addresses: true } },
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: {
        include: { items: { select: { quantity: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })
  if (!row) return null

  return {
    ...customerRow({ ...row, orders: row.orders }),
    addresses: row.addresses.map((address) => ({
      id: address.id,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      area: address.area,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
      deliveryNotes: address.deliveryNotes,
      isDefault: address.isDefault,
    })),
    orders: row.orders.map((order) => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      currency: order.currency,
      total: toNumber(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
  }
}

export function adminCustomerDisplayName(customer: {
  firstName: string | null
  lastName: string | null
  email: string | null
}) {
  return customerNameParts(customer) || customer.email || "Customer"
}
