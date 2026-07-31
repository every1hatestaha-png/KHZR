export const SITE = {
  name: "KHZR",
  legalName: "KHZR Maison",
  tagline: "Quiet luxury, tailored for the considered.",
  description:
    "KHZR is an international fashion house. Garments, collections and campaigns composed with restraint — cut to last, finished by hand.",
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
  shippingNote: "Complimentary shipping worldwide on orders over $350",
  currency: "USD",
} as const

export const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Journal", href: "/journal" },
  { label: "Maison", href: "/about" },
] as const

export const FOOTER_LINKS = {
  house: [
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/about#careers" },
    { label: "Sustainability", href: "/about#sustainability" },
  ],
  client: [
    { label: "Shipping & Returns", href: "/contact#shipping" },
    { label: "Size Guide", href: "/contact#size-guide" },
    { label: "Care Guide", href: "/journal" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const

export const SORT_OPTIONS = [
  { value: "featured", label: "Curated" },
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
