export const SITE = {
  name: "KHZR",
  legalName: "KHZR Studio",
  tagline: "Womenswear with a clear line.",
  description:
    "KHZR is a womenswear label for sharp silhouettes, warm neutrals, and clothes that move from day to evening.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://khzr.example.com",
  locale: "en_US",
  email: "care@khzr.example.com",
  phone: "+1 212 555 0148",
  address: {
    line1: "12 Mercer Street",
    line2: "SoHo",
    city: "New York",
    region: "NY",
    postalCode: "10013",
    country: "US",
  },
  social: {
    instagram: "https://instagram.com",
    pinterest: "https://pinterest.com",
  },
  freeShippingThreshold: 350,
  shippingNote: "Complimentary shipping on orders over $350",
  currency: "USD",
} as const

export const NAV_LINKS = [
  { label: "New In", href: "/collections?sort=newest" },
  { label: "Shop", href: "/collections" },
  { label: "Collections", href: "/collections" },
  { label: "Occasion", href: "/collection/evening" },
  { label: "Essentials", href: "/collection/essentials" },
] as const

export const FOOTER_LINKS = {
  house: [
    { label: "About KHZR", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  client: [
    { label: "Shipping & Returns", href: "/contact#shipping" },
    { label: "Size & Fit", href: "/contact#size-guide" },
    { label: "Care", href: "/contact#care" },
  ],
} as const

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New Arrivals" },
  { value: "price-asc", label: "Price, Low to High" },
  { value: "price-desc", label: "Price, High to Low" },
] as const

export const CART_COOKIE = "khzr_cart"
export const CART_TTL_DAYS = 30

/** Shipping pricing architecture — flat standard rate, complimentary over the threshold. */
export const SHIPPING = {
  standardRate: 15,
  standardLabel: "Standard Shipping",
  complimentaryLabel: "Complimentary Shipping",
} as const

/** Tax architecture — single flat rate applied to the discounted subtotal (US default). */
export const TAX_RATE = 0.08875
export const TAX_LABEL = "Duties & Taxes"

/** Countries offered for checkout shipping (ISO 3166-1 alpha-2, Stripe-compatible). */
export const CHECKOUT_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "IE",
  "FR",
  "DE",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "CH",
  "AT",
  "SE",
  "DK",
  "NO",
  "FI",
  "AU",
  "NZ",
  "JP",
  "AE",
  "SG",
] as const

export const ORDER_NUMBER_PREFIX = "KHZR"
