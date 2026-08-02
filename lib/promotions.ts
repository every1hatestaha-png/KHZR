import "server-only"

import { prisma } from "@/lib/prisma"
import { calculateTax, roundMoney } from "@/lib/services/pricing-service"
import type { CartState } from "@/types"

export type PromotionQuote = {
  promotionId: string | null
  promotionName: string | null
  couponCode: string | null
  promotionType: string | null
  discount: number
  shipping: number
  freeShippingApplied: boolean
  subtotal: number
  tax: number
  total: number
}

export type PromotionQuoteResult =
  | { ok: true; quote: PromotionQuote }
  | { ok: false; error: string }

type PromotionRow = Awaited<ReturnType<typeof findCandidatePromotions>>[number]

function normalizeCode(code?: string | null) {
  const trimmed = code?.trim().toUpperCase() ?? ""
  return trimmed || null
}

async function findCandidatePromotions(code?: string | null) {
  const now = new Date()
  return prisma.promotion.findMany({
    where: {
      active: true,
      ...(code ? { code: normalizeCode(code), trigger: "COUPON" as const } : { trigger: "AUTOMATIC" as const }),
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    include: { products: true, collections: true },
  })
}

async function eligibleSubtotal(promotion: PromotionRow, cart: CartState) {
  if (promotion.scope === "STORE") return cart.subtotal
  const productIds = new Set(promotion.products.map((item) => item.productId))
  if (promotion.scope === "PRODUCTS") {
    return cart.lines.reduce((sum, line) => sum + (productIds.has(line.productId) ? line.unitPrice * line.quantity : 0), 0)
  }
  const collectionIds = promotion.collections.map((item) => item.collectionId)
  if (collectionIds.length === 0) return 0
  const matches = await prisma.productCollection.findMany({
    where: { collectionId: { in: collectionIds }, productId: { in: cart.lines.map((line) => line.productId) } },
    select: { productId: true },
  })
  const matchedProductIds = new Set(matches.map((item) => item.productId))
  return cart.lines.reduce((sum, line) => sum + (matchedProductIds.has(line.productId) ? line.unitPrice * line.quantity : 0), 0)
}

async function customerUses(promotion: PromotionRow, userId?: string | null, email?: string | null) {
  if (!promotion.usesPerCustomer) return 0
  if (!userId && !email) return 0
  return prisma.promotionRedemption.count({
    where: {
      promotionId: promotion.id,
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    },
  })
}

async function evaluateOne(input: {
  promotion: PromotionRow
  cart: CartState
  shipping: number
  userId?: string | null
  email?: string | null
}) {
  const { promotion, cart, shipping, userId, email } = input
  if (promotion.maxUses !== null && promotion.usageCount >= promotion.maxUses) return null
  if (promotion.minimumOrderValue !== null && cart.subtotal < Number(promotion.minimumOrderValue)) return null
  if (promotion.usesPerCustomer && (await customerUses(promotion, userId, email)) >= promotion.usesPerCustomer) return null

  const eligible = await eligibleSubtotal(promotion, cart)
  if (eligible <= 0) return null

  let discount = 0
  if (promotion.discountType === "PERCENTAGE") {
    discount = roundMoney((eligible * Number(promotion.percentage ?? 0)) / 100)
  } else if (promotion.discountType === "FIXED_AMOUNT") {
    discount = roundMoney(Math.min(Number(promotion.amount ?? 0), eligible))
  } else {
    discount = roundMoney(shipping)
  }
  if (discount <= 0) return null
  return { promotion, discount }
}

export async function quotePromotions(input: {
  cart: CartState
  shipping: number
  couponCode?: string | null
  userId?: string | null
  email?: string | null
}): Promise<PromotionQuoteResult> {
  const code = normalizeCode(input.couponCode)
  const candidates = await findCandidatePromotions(code)
  if (code && candidates.length === 0) return { ok: false, error: "That code is not active." }

  const evaluated = []
  for (const promotion of candidates) {
    const result = await evaluateOne({ ...input, promotion })
    if (result) evaluated.push(result)
  }
  if (code && evaluated.length === 0) return { ok: false, error: "That code is not eligible for this order." }

  const best = evaluated.sort((a, b) => b.discount - a.discount)[0]
  const discount = roundMoney(Math.min(best?.discount ?? 0, input.cart.subtotal + input.shipping))
  const freeShippingApplied = best?.promotion.discountType === "FREE_SHIPPING"
  const shipping = freeShippingApplied ? 0 : input.shipping
  const merchandiseDiscount = freeShippingApplied ? 0 : Math.min(discount, input.cart.subtotal)
  const taxable = roundMoney(input.cart.subtotal - merchandiseDiscount)
  const taxTotal = calculateTax(taxable)
  const total = roundMoney(Math.max(0, taxable + taxTotal + shipping))

  return {
    ok: true,
    quote: {
      promotionId: best?.promotion.id ?? null,
      promotionName: best?.promotion.name ?? null,
      couponCode: best?.promotion.code ?? code,
      promotionType: best?.promotion.discountType ?? null,
      discount,
      shipping,
      freeShippingApplied,
      subtotal: roundMoney(input.cart.subtotal),
      tax: taxTotal,
      total,
    },
  }
}
