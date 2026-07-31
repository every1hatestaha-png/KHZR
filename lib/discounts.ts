import type { Discount } from "@/types"

/** Client-recognised discount codes. A server-verified catalogue arrives with the checkout phase. */
const DISCOUNT_CODES: Discount[] = [
  {
    code: "KHZR10",
    label: "10% off your selection",
    percent: 10,
    minSpend: 50,
  },
  {
    code: "KHZR50",
    label: "$50 toward your selection",
    amount: 50,
    minSpend: 100,
  },
]

export function applyDiscountCode(code: string): Discount | null {
  const normalized = code.trim().toUpperCase()
  const found = DISCOUNT_CODES.find((d) => d.code === normalized)
  return found ? { ...found } : null
}

export function discountAmount(
  discount: Discount | null,
  subtotal: number
): number {
  if (!discount || subtotal < discount.minSpend) return 0
  if (discount.percent) return (subtotal * discount.percent) / 100
  return Math.min(discount.amount ?? 0, subtotal)
}
