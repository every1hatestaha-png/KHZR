"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/actions/admin-actions"
import { promotionIdSchema, promotionSchema } from "@/lib/validations/promotions"

export type PromotionActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; error: string }

function dateOrNull(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function slugs(value: string) {
  return value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean)
}

async function targetIds(productSlugs: string, collectionSlugs: string) {
  const [products, collections] = await Promise.all([
    prisma.product.findMany({ where: { slug: { in: slugs(productSlugs) } }, select: { id: true } }),
    prisma.collection.findMany({ where: { slug: { in: slugs(collectionSlugs) } }, select: { id: true } }),
  ])
  return { productIds: products.map((p) => p.id), collectionIds: collections.map((c) => c.id) }
}

function revalidatePromotions() {
  revalidatePath("/admin/promotions")
  revalidatePath("/checkout")
}

export async function savePromotionAction(input: unknown): Promise<PromotionActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = promotionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Promotion could not be read." }
  const data = parsed.data
  const code = data.trigger === "COUPON" ? data.code.toUpperCase() : null
  const targets = await targetIds(data.productSlugs, data.collectionSlugs)

  try {
    const promotion = await prisma.$transaction(async (tx) => {
      const saved = data.id
        ? await tx.promotion.update({
            where: { id: data.id },
            data: baseData(data, code),
          })
        : await tx.promotion.create({ data: baseData(data, code) })
      await tx.promotionProduct.deleteMany({ where: { promotionId: saved.id } })
      await tx.promotionCollection.deleteMany({ where: { promotionId: saved.id } })
      if (data.scope === "PRODUCTS" && targets.productIds.length > 0) {
        await tx.promotionProduct.createMany({ data: targets.productIds.map((productId) => ({ promotionId: saved.id, productId })), skipDuplicates: true })
      }
      if (data.scope === "COLLECTIONS" && targets.collectionIds.length > 0) {
        await tx.promotionCollection.createMany({ data: targets.collectionIds.map((collectionId) => ({ promotionId: saved.id, collectionId })), skipDuplicates: true })
      }
      return saved
    })
    revalidatePromotions()
    return { ok: true, id: promotion.id, message: data.id ? "Promotion updated." : "Promotion created." }
  } catch (err) {
    console.error("[admin] promotion save failed:", err instanceof Error ? err.message : "unknown")
    return { ok: false, error: "Promotion could not be saved. Check the code is unique." }
  }
}

function baseData(data: ReturnType<typeof promotionSchema.parse>, code: string | null) {
  return {
    name: data.name,
    code,
    active: data.active,
    trigger: data.trigger,
    scope: data.scope,
    discountType: data.discountType,
    percentage: data.discountType === "PERCENTAGE" ? data.percentage : null,
    amount: data.discountType === "FIXED_AMOUNT" ? data.amount : null,
    startsAt: dateOrNull(data.startsAt),
    endsAt: dateOrNull(data.endsAt),
    maxUses: data.maxUses || null,
    usesPerCustomer: data.usesPerCustomer || null,
    minimumOrderValue: data.minimumOrderValue || null,
  }
}

export async function disablePromotionAction(input: unknown): Promise<PromotionActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = promotionIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Promotion could not be read." }
  await prisma.promotion.update({ where: { id: parsed.data.id }, data: { active: false } })
  revalidatePromotions()
  return { ok: true, message: "Promotion disabled." }
}

export async function duplicatePromotionAction(input: unknown): Promise<PromotionActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = promotionIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Promotion could not be read." }
  const source = await prisma.promotion.findUnique({ where: { id: parsed.data.id }, include: { products: true, collections: true } })
  if (!source) return { ok: false, error: "Promotion not found." }
  const copy = await prisma.promotion.create({
    data: {
      name: `${source.name} Copy`,
      code: source.code ? `${source.code}-COPY-${Date.now().toString(36).toUpperCase()}` : null,
      active: false,
      trigger: source.trigger,
      scope: source.scope,
      discountType: source.discountType,
      percentage: source.percentage,
      amount: source.amount,
      startsAt: source.startsAt,
      endsAt: source.endsAt,
      maxUses: source.maxUses,
      usesPerCustomer: source.usesPerCustomer,
      minimumOrderValue: source.minimumOrderValue,
      products: { create: source.products.map((item) => ({ productId: item.productId })) },
      collections: { create: source.collections.map((item) => ({ collectionId: item.collectionId })) },
    },
  })
  revalidatePromotions()
  return { ok: true, id: copy.id, message: "Promotion duplicated." }
}

export async function deletePromotionAction(input: unknown): Promise<PromotionActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }
  const parsed = promotionIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Promotion could not be read." }

  const promotion = await prisma.promotion.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      _count: { select: { orders: true, redemptions: true } },
    },
  })
  if (!promotion) return { ok: false, error: "Promotion not found." }
  if (promotion._count.orders > 0 || promotion._count.redemptions > 0) {
    return {
      ok: false,
      error: "This promotion has usage history. Disable it instead of deleting it.",
    }
  }

  await prisma.promotion.delete({ where: { id: promotion.id } })
  revalidatePromotions()
  return { ok: true, message: "Promotion deleted." }
}
