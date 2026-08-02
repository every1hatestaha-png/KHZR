import { SITE } from "@/lib/constants"
import { SHIPPING, TAX_RATE } from "@/lib/constants"
import { discountAmount } from "@/lib/discounts"
import type { Discount } from "@/types"

/** Rounds a money value to the cent. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Shipping cost for a pre-discount subtotal. Complimentary over the threshold. */
export function calculateShipping(subtotal: number): number {
  return subtotal >= SITE.freeShippingThreshold ? 0 : SHIPPING.standardRate
}

/** Tax for a discounted subtotal, at the configured flat rate. */
export function calculateTax(subtotalAfterDiscount: number): number {
  return roundMoney(subtotalAfterDiscount * TAX_RATE)
}

/** The discount amount valid for this subtotal, rounded to the cent. */
export function calculateDiscount(
  discount: Discount | null,
  subtotal: number
): number {
  return roundMoney(discountAmount(discount, subtotal))
}

export type PriceBreakdown = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}

/** The full order price breakdown from a pre-discount subtotal. */
export function priceBreakdown(
  subtotal: number,
  discount: Discount | null
): PriceBreakdown {
  const discountTotal = calculateDiscount(discount, subtotal)
  const taxable = roundMoney(subtotal - discountTotal)
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(Math.max(0, taxable))
  const total = roundMoney(taxable + tax + shipping)
  return { subtotal, discount: discountTotal, shipping, tax, total }
}

export function priceBreakdownWithShipping(
  subtotal: number,
  discount: Discount | null,
  shipping: number
): PriceBreakdown {
  const discountTotal = calculateDiscount(discount, subtotal)
  const taxable = roundMoney(subtotal - discountTotal)
  const tax = calculateTax(Math.max(0, taxable))
  const total = roundMoney(taxable + tax + shipping)
  return { subtotal, discount: discountTotal, shipping, tax, total }
}
