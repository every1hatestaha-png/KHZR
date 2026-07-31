"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  collectionSchema,
  inventoryUpdateSchema,
  productSchema,
} from "@/lib/validations/admin"
import { uploadProductImage } from "@/lib/services/media-service"

export type AdminActionResult =
  | { ok: true; message?: string; productId?: string }
  | { ok: false; error: string }

function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

/** Returns an error string when the caller is not an admin, else null. */
export async function requireAdmin(): Promise<string | null> {
  if (!clerkConfigured()) return null
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const session = await auth()
    const role = (
      session.sessionClaims?.metadata as { role?: string } | undefined
    )?.role
    if (role === "admin") return null
  } catch {
    return "Authentication could not be verified."
  }
  return "You must be signed in as an administrator."
}

function revalidateAll() {
  revalidatePath("/", "layout")
}

function slugTakenError() {
  return { ok: false as const, error: "A product with this slug already exists." }
}

export async function createProductAction(input: unknown): Promise<AdminActionResult> {
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

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) return { ok: false, error: "This product no longer exists." }
    await prisma.product.delete({ where: { id } })
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

export async function toggleFeatureAction(id: string): Promise<AdminActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isFeatured: true },
    })
    if (!product) return { ok: false, error: "This product no longer exists." }
    await prisma.product.update({
      where: { id },
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

  try {
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { _count: { select: { products: true } } },
    })
    if (!existing) return { ok: false, error: "This collection no longer exists." }
    if (existing._count.products > 0) {
      return {
        ok: false,
        error: `This collection contains ${existing._count.products} product(s). Remove them first.`,
      }
    }
    await prisma.collection.delete({ where: { id } })
    revalidateAll()
    return { ok: true, message: "Collection deleted." }
  } catch {
    return { ok: false, error: "The collection could not be deleted." }
  }
}

export async function uploadImageAction(
  formData: FormData
): Promise<{ ok: true; url: string; publicId: string } | { ok: false; error: string }> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No image file was provided." }
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Image must be smaller than 8 MB." }
  }

  const uploaded = await uploadProductImage(file)
  if (!uploaded) {
    return {
      ok: false,
      error:
        "Cloudinary is not configured. Paste an image URL instead, or set the Cloudinary keys in your environment.",
    }
  }
  return { ok: true, url: uploaded.url, publicId: uploaded.publicId }
}
