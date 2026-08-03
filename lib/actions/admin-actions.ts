"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  bulkPriceUpdateSchema,
  bulkProductActionSchema,
  collectionSchema,
  homepageSettingsSchema,
  inventoryUpdateSchema,
  mediaAssetSchema,
  productSchema,
  storeSettingsSchema,
} from "@/lib/validations/admin"
import { uploadProductImage } from "@/lib/services/media-service"
import {
  importProductsFromCsv,
  previewProductImport,
  productImportSampleCsv,
} from "@/lib/product-import"
import { requireAdminAccess } from "@/lib/services/admin-auth"
import { rateLimit } from "@/lib/services/rate-limit"

export type AdminActionResult =
  | { ok: true; message?: string; productId?: string; slug?: string }
  | { ok: false; error: string }

export type ProductImportActionResult =
  | { ok: true; result: Awaited<ReturnType<typeof previewProductImport>> | Awaited<ReturnType<typeof importProductsFromCsv>> }
  | { ok: false; error: string }

const adminIdSchema = z.string().min(1).max(160)

/** Returns an error string when the caller is not an admin, else null. */
export async function requireAdmin(): Promise<string | null> {
  return requireAdminAccess()
}

function revalidateAll() {
  revalidatePath("/", "layout")
}

function parseJsonText(value: string) {
  if (!value.trim()) return null
  return JSON.parse(value)
}

function slugTakenError() {
  return { ok: false as const, error: "A product with this slug already exists." }
}

function copySuffix() {
  return Date.now().toString(36).toLowerCase()
}

function copyValue(value: string | null, suffix: string) {
  return value ? `${value}-copy-${suffix}` : null
}

export async function createProductAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:product-create", 40, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many product creates. Please try again later." }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "The form could not be read.",
    }
  }
  const data = parsed.data

  try {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    })
    if (existing) return slugTakenError()

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        subtitle: data.subtitle || null,
        description: data.description || null,
        composition: data.composition || null,
        care: data.care || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        currency: data.currency,
        status: data.status,
        stockStatus: data.stockStatus,
        sku: data.sku || null,
        isNew: data.isNew,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: v.sku,
            priceOverride: v.priceOverride,
            stock: v.stock,
            lowStockAt: v.lowStockAt,
            active: v.active,
          })),
        },
        media: {
          create: data.images.map((image, i) => ({
            publicId: image.url,
            url: image.url,
            alt: image.alt || data.name,
            kind: "IMAGE",
            position: i,
          })),
        },
        collections: {
          create: data.collectionIds.map((collectionId, i) => ({
            collection: { connect: { id: collectionId } },
            position: i,
          })),
        },
      },
    })

    revalidateAll()
    return { ok: true, productId: product.id, message: "Product created." }
  } catch {
    return { ok: false, error: "The product could not be saved. Check the database is reachable and details are unique." }
  }
}

export async function updateProductAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "The form could not be read.",
    }
  }
  const data = parsed.data
  if (!data.id) return { ok: false, error: "A product id is required." }
  const productId: string = data.id

  try {
    const slugConflict = await prisma.product.findFirst({
      where: { slug: data.slug, id: { not: data.id } },
      select: { id: true },
    })
    if (slugConflict) return slugTakenError()

    await prisma.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: {
            name: data.name,
            slug: data.slug,
            subtitle: data.subtitle || null,
            description: data.description || null,
            composition: data.composition || null,
            care: data.care || null,
            price: data.price,
            compareAtPrice: data.compareAtPrice,
            currency: data.currency,
            status: data.status,
            stockStatus: data.stockStatus,
            sku: data.sku || null,
            isNew: data.isNew,
            isFeatured: data.isFeatured,
            sortOrder: data.sortOrder,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
          },
        })

        // ── Collections (sync) ────────────────────────────────────
        await tx.productCollection.deleteMany({ where: { productId } })
        if (data.collectionIds.length > 0) {
          await tx.productCollection.createMany({
            data: data.collectionIds.map((collectionId, i) => ({
              productId,
              collectionId,
              position: i,
            })),
          })
        }

        // ── Media (rebuild) ───────────────────────────────────────
        await tx.productMedia.deleteMany({ where: { productId } })
        await tx.productMedia.createMany({
          data: data.images.map((image, i) => ({
            productId,
            publicId: image.url,
            url: image.url,
            alt: image.alt || data.name,
            kind: "IMAGE",
            position: i,
          })),
        })

        // ── Variants (upsert, deactivate removed) ────────────────
        const existing = await tx.productVariant.findMany({
          where: { productId },
          select: { id: true },
        })
        const incomingIds = new Set(
          data.variants.map((v) => v.id).filter((id): id is string => Boolean(id))
        )
        for (const v of data.variants) {
          const payload = {
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: v.sku,
            priceOverride: v.priceOverride,
            stock: v.stock,
            lowStockAt: v.lowStockAt,
            active: v.active,
          }
          if (v.id) {
            await tx.productVariant.update({ where: { id: v.id }, data: payload })
          } else {
            await tx.productVariant.create({
              data: { productId, ...payload },
            })
          }
        }
        for (const ev of existing) {
          if (!incomingIds.has(ev.id)) {
            await tx.productVariant.update({
              where: { id: ev.id },
              data: { active: false },
            })
          }
        }
      },
      { timeout: 20000 }
    )

    revalidateAll()
    return { ok: true, message: "Product updated." }
  } catch {
    return {
      ok: false,
      error:
        "The product could not be saved. A size/colour combination may be duplicated, or the database is unreachable.",
    }
  }
}

export async function deleteProductAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Product could not be read." }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsed.data },
      select: { id: true },
    })
    if (!existing) return { ok: false, error: "This product no longer exists." }
    await prisma.product.delete({ where: { id: parsed.data } })
    revalidateAll()
    return { ok: true, message: "Product deleted." }
  } catch {
    return {
      ok: false,
      error:
        "This product cannot be deleted — it is referenced by orders or other records. Archive it instead.",
    }
  }
}

export async function archiveProductAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Product could not be read." }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsed.data },
      select: { id: true, status: true },
    })
    if (!existing) return { ok: false, error: "This product no longer exists." }
    if (existing.status === "ARCHIVED") {
      return { ok: true, message: "Product is already archived." }
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: parsed.data },
        data: { status: "ARCHIVED", isFeatured: false, stockStatus: "OUT_OF_STOCK" },
      }),
      prisma.productVariant.updateMany({
        where: { productId: parsed.data },
        data: { active: false },
      }),
    ])
    revalidateAll()
    return { ok: true, message: "Product archived." }
  } catch {
    return { ok: false, error: "The product could not be archived." }
  }
}

export async function duplicateProductAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Product could not be read." }

  try {
    const source = await prisma.product.findUnique({
      where: { id: parsed.data },
      include: {
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
        media: { orderBy: { position: "asc" } },
        collections: { orderBy: { position: "asc" } },
      },
    })
    if (!source) return { ok: false, error: "This product no longer exists." }

    const suffix = copySuffix()
    const slug = `${source.slug}-copy-${suffix}`
    const product = await prisma.product.create({
      data: {
        name: `${source.name} Copy`,
        slug,
        subtitle: source.subtitle,
        description: source.description,
        composition: source.composition,
        care: source.care,
        price: source.price,
        compareAtPrice: source.compareAtPrice,
        currency: source.currency,
        status: "DRAFT",
        stockStatus: source.stockStatus,
        sku: copyValue(source.sku, suffix),
        isNew: source.isNew,
        isFeatured: false,
        sortOrder: source.sortOrder,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        variants: {
          create: source.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            sku: `${variant.sku}-copy-${suffix}`,
            priceOverride: variant.priceOverride,
            stock: variant.stock,
            lowStockAt: variant.lowStockAt,
            active: variant.active,
          })),
        },
        media: {
          create: source.media.map((image) => ({
            publicId: image.publicId,
            url: image.url,
            alt: image.alt,
            kind: image.kind,
            position: image.position,
          })),
        },
        collections: {
          create: source.collections.map((item) => ({
            collectionId: item.collectionId,
            position: item.position,
          })),
        },
      },
    })

    revalidateAll()
    return { ok: true, productId: product.id, slug, message: "Draft product copy created." }
  } catch {
    return { ok: false, error: "The product could not be duplicated." }
  }
}

export async function toggleFeatureAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Product could not be read." }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsed.data },
      select: { id: true, isFeatured: true },
    })
    if (!product) return { ok: false, error: "This product no longer exists." }
    await prisma.product.update({
      where: { id: parsed.data },
      data: { isFeatured: !product.isFeatured },
    })
    revalidateAll()
    return {
      ok: true,
      message: product.isFeatured ? "Removed from the featured rail." : "Featured on the homepage.",
    }
  } catch {
    return { ok: false, error: "The feature state could not be updated." }
  }
}

export async function bulkProductAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:bulk-products", 30, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many bulk actions. Please try again later." }
  const parsed = bulkProductActionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Bulk action could not be read." }
  const { productIds, action } = parsed.data

  const data =
    action === "feature"
      ? { isFeatured: true }
      : action === "unfeature"
        ? { isFeatured: false }
        : action === "archive"
          ? { status: "ARCHIVED" as const, isFeatured: false, stockStatus: "OUT_OF_STOCK" as const }
          : { status: "ACTIVE" as const }

  await prisma.product.updateMany({ where: { id: { in: productIds } }, data })
  if (action === "archive") {
    await prisma.productVariant.updateMany({ where: { productId: { in: productIds } }, data: { active: false } })
  }
  revalidateAll()
  return { ok: true, message: "Bulk product action applied." }
}

export async function bulkPriceUpdateAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:bulk-price", 20, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many bulk price updates. Please try again later." }
  const parsed = bulkPriceUpdateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Bulk price update could not be read." }
  await prisma.product.updateMany({
    where: { id: { in: parsed.data.productIds } },
    data: { price: parsed.data.price, compareAtPrice: parsed.data.compareAtPrice },
  })
  revalidateAll()
  return { ok: true, message: "Bulk prices updated." }
}

export async function updateInventoryAction(
  input: unknown
): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = inventoryUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "The inventory update could not be read." }
  }

  try {
    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: item.stock,
            ...(item.active !== undefined ? { active: item.active } : {}),
          },
        })
      )
    )
    revalidateAll()
    return { ok: true, message: "Inventory updated." }
  } catch {
    return { ok: false, error: "Inventory could not be updated." }
  }
}

export async function createCollectionAction(
  input: unknown
): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = collectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "The form could not be read.",
    }
  }
  const data = parsed.data

  try {
    const existing = await prisma.collection.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    })
    if (existing)
      return { ok: false, error: "A collection with this slug already exists." }

    await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        editorial: data.editorial || null,
        imageUrl: data.imageUrl || null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        publishedAt: new Date(),
      },
    })
    revalidateAll()
    return { ok: true, message: "Collection created." }
  } catch {
    return { ok: false, error: "The collection could not be created." }
  }
}

export async function updateCollectionAction(
  input: unknown
): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = collectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "The form could not be read.",
    }
  }
  const data = parsed.data
  if (!data.id) return { ok: false, error: "A collection id is required." }

  try {
    const conflict = await prisma.collection.findFirst({
      where: { slug: data.slug, id: { not: data.id } },
      select: { id: true },
    })
    if (conflict)
      return { ok: false, error: "A collection with this slug already exists." }

    await prisma.collection.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        editorial: data.editorial || null,
        imageUrl: data.imageUrl || null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    })
    revalidateAll()
    return { ok: true, message: "Collection updated." }
  } catch {
    return { ok: false, error: "The collection could not be updated." }
  }
}

export async function deleteCollectionAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Collection could not be read." }

  try {
    const existing = await prisma.collection.findUnique({
      where: { id: parsed.data },
      select: { _count: { select: { products: true } } },
    })
    if (!existing) return { ok: false, error: "This collection no longer exists." }
    if (existing._count.products > 0) {
      return {
        ok: false,
        error: `This collection contains ${existing._count.products} product(s). Remove them first.`,
      }
    }
    await prisma.collection.delete({ where: { id: parsed.data } })
    revalidateAll()
    return { ok: true, message: "Collection deleted." }
  } catch {
    return { ok: false, error: "The collection could not be deleted." }
  }
}

export async function toggleCollectionPublishedAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Collection could not be read." }
  const collection = await prisma.collection.findUnique({ where: { id: parsed.data }, select: { publishedAt: true } })
  if (!collection) return { ok: false, error: "This collection no longer exists." }
  await prisma.collection.update({ where: { id: parsed.data }, data: { publishedAt: collection.publishedAt ? null : new Date() } })
  revalidateAll()
  return { ok: true, message: collection.publishedAt ? "Collection hidden." : "Collection published." }
}

export async function uploadImageAction(
  formData: FormData
): Promise<{ ok: true; url: string; publicId: string } | { ok: false; error: string }> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:image-upload", 40, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many image uploads. Please try again later." }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No image file was provided." }
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Image must be smaller than 8 MB." }
  }
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ]
  if (!allowedTypes.includes(file.type)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, GIF, and AVIF images can be uploaded.",
    }
  }

  const uploaded = await uploadProductImage(file)
  if (!uploaded) {
    return {
      ok: false,
      error:
        "Cloudinary is not configured. Paste an image URL instead, or set the Cloudinary keys in your environment.",
    }
  }
  await prisma.mediaAsset.upsert({
    where: { url: uploaded.url },
    update: { publicId: uploaded.publicId, source: "cloudinary" },
    create: { url: uploaded.url, publicId: uploaded.publicId, source: "cloudinary" },
  })
  return { ok: true, url: uploaded.url, publicId: uploaded.publicId }
}

export async function saveMediaAssetAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = mediaAssetSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Image could not be read." }
  await prisma.mediaAsset.upsert({
    where: { url: parsed.data.url },
    update: { alt: parsed.data.alt || null, publicId: parsed.data.publicId || null },
    create: { url: parsed.data.url, alt: parsed.data.alt || null, publicId: parsed.data.publicId || null },
  })
  revalidatePath("/admin/media")
  return { ok: true, message: "Image saved to media library." }
}

export async function deleteMediaAssetAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = adminIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Image could not be read." }
  const asset = await prisma.mediaAsset.findUnique({ where: { id: parsed.data }, select: { id: true, url: true } })
  if (!asset) return { ok: false, error: "Image not found." }
  const [products, collections, settings] = await Promise.all([
    prisma.productMedia.count({ where: { url: asset.url } }),
    prisma.collection.count({ where: { imageUrl: asset.url } }),
    prisma.storeSettings.count({ where: { heroImageUrl: asset.url } }),
  ])
  if (products + collections + settings > 0) {
    return { ok: false, error: "This image is in use. Remove it from products, collections or homepage first." }
  }
  await prisma.mediaAsset.delete({ where: { id: asset.id } })
  revalidatePath("/admin/media")
  return { ok: true, message: "Image deleted." }
}

export async function saveStoreSettingsAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = storeSettingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Settings could not be read." }
  try {
    await prisma.storeSettings.upsert({
      where: { id: "store" },
      update: {
        ...parsed.data,
        ownerNotificationEmail: parsed.data.ownerNotificationEmail || null,
        customerSupportEmail: parsed.data.customerSupportEmail || null,
        instagramUrl: parsed.data.instagramUrl || null,
        facebookUrl: parsed.data.facebookUrl || null,
        contactDetails: parsed.data.contactDetails || null,
        returnPolicyText: parsed.data.returnPolicyText || null,
        shippingPolicyText: parsed.data.shippingPolicyText || null,
        footerLinks: parseJsonText(parsed.data.footerLinks),
      },
      create: {
        id: "store",
        ...parsed.data,
        ownerNotificationEmail: parsed.data.ownerNotificationEmail || null,
        customerSupportEmail: parsed.data.customerSupportEmail || null,
        instagramUrl: parsed.data.instagramUrl || null,
        facebookUrl: parsed.data.facebookUrl || null,
        contactDetails: parsed.data.contactDetails || null,
        returnPolicyText: parsed.data.returnPolicyText || null,
        shippingPolicyText: parsed.data.shippingPolicyText || null,
        footerLinks: parseJsonText(parsed.data.footerLinks),
      },
    })
    revalidateAll()
    return { ok: true, message: "Store settings saved." }
  } catch {
    return { ok: false, error: "Settings could not be saved. Check JSON fields." }
  }
}

export async function saveHomepageSettingsAction(input: unknown): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = homepageSettingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Homepage settings could not be read." }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.storeSettings.upsert({
        where: { id: "store" },
        update: {
          heroImageUrl: parsed.data.heroImageUrl || null,
          heroLabel: parsed.data.heroLabel || null,
          heroHeading: parsed.data.heroHeading || null,
          heroDescription: parsed.data.heroDescription || null,
          heroButtonText: parsed.data.heroButtonText || null,
          heroButtonLink: parsed.data.heroButtonLink || null,
          announcementText: parsed.data.announcementText || null,
          announcementActive: parsed.data.announcementActive,
          homepageCategoryLinks: parseJsonText(parsed.data.homepageCategoryLinks),
        },
        create: {
          id: "store",
          heroImageUrl: parsed.data.heroImageUrl || null,
          heroLabel: parsed.data.heroLabel || null,
          heroHeading: parsed.data.heroHeading || null,
          heroDescription: parsed.data.heroDescription || null,
          heroButtonText: parsed.data.heroButtonText || null,
          heroButtonLink: parsed.data.heroButtonLink || null,
          announcementText: parsed.data.announcementText || null,
          announcementActive: parsed.data.announcementActive,
          homepageCategoryLinks: parseJsonText(parsed.data.homepageCategoryLinks),
        },
      })
      await tx.product.updateMany({ data: { isFeatured: false } })
      if (parsed.data.featuredProductIds.length > 0) {
        await tx.product.updateMany({ where: { id: { in: parsed.data.featuredProductIds } }, data: { isFeatured: true } })
      }
      await tx.collection.updateMany({ data: { isFeatured: false } })
      if (parsed.data.featuredCollectionIds.length > 0) {
        await tx.collection.updateMany({ where: { id: { in: parsed.data.featuredCollectionIds } }, data: { isFeatured: true } })
      }
    })
    revalidateAll()
    return { ok: true, message: "Homepage settings saved." }
  } catch {
    return { ok: false, error: "Homepage settings could not be saved. Check JSON fields." }
  }
}

function csvFileFromFormData(formData: FormData) {
  const file = formData.get("file")
  if (!(file instanceof File)) throw new Error("Upload a CSV file.")
  return file
}

export async function previewProductImportAction(formData: FormData): Promise<ProductImportActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:product-import-preview", 30, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many import previews. Please try again later." }
  try {
    return { ok: true, result: await previewProductImport(csvFileFromFormData(formData)) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The CSV could not be previewed." }
  }
}

export async function importProductCsvAction(formData: FormData): Promise<ProductImportActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const allowed = await rateLimit("admin:product-import", 10, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Too many import attempts. Please try again later." }
  try {
    const result = await importProductsFromCsv({
      file: csvFileFromFormData(formData),
      dryRun: formData.get("dryRun") === "true",
      validRowsOnly: formData.get("validRowsOnly") === "true",
    })
    if (result.imported) revalidateAll()
    return { ok: true, result }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The CSV could not be imported." }
  }
}

export async function productImportSampleCsvAction(): Promise<string> {
  const denied = await requireAdmin()
  if (denied) return ""
  return productImportSampleCsv()
}
