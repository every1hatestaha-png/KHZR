export type CartLine = {
  id: string
  variantId: string
  productId: string
  productSlug: string
  name: string
  subtitle: string | null
  size: string
  color: string
  colorHex: string | null
  imageUrl: string | null
  unitPrice: number
  quantity: number
  available: number
}

export type CartState = {
  lines: CartLine[]
  count: number
  subtotal: number
  currency: string
}

export function emptyCart(): CartState {
  return { lines: [], count: 0, subtotal: 0, currency: "USD" }
}

export type CartActionResult = {
  ok: boolean
  error?: string
  /** null when persistence is unavailable (no DATABASE_URL) — client keeps optimistic state */
  cart: CartState | null
}

export type ProductSummary = {
  productId: string
  productSlug: string
  variantId: string
  name: string
  subtitle: string | null
  size: string
  color: string
  colorHex: string | null
  imageUrl: string | null
  unitPrice: number
  available: number
}
