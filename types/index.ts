export type CartLine = {
  id: string
  variantId: string
  productId: string
  productSlug: string
  sku: string
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
  return { lines: [], count: 0, subtotal: 0, currency: "PKR" }
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

export type Discount = {
  code: string
  label: string
  /** Percentage off the subtotal, e.g. 10 for 10%. */
  percent?: number
  /** Fixed amount off the subtotal, in the site currency. */
  amount?: number
  /** Minimum pre-discount subtotal required to qualify. */
  minSpend: number
}

export type WishlistActionResult = {
  ok: boolean
  error?: string
  signedIn?: boolean
  /** Full saved list from the server (signed-in sessions). */
  items?: ProductSummary[]
}
