export const SITE = {
  name: "KHZR",
  legalName: "KHZR Studio",
  tagline: "Womenswear with a clear line.",
  description:
    "KHZR makes ready-to-wear eastern dresses for women in Pakistan, priced for everyday launch shopping in PKR.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://khzr.studio",
  locale: "en_PK",
  email: "care@khzr.studio",
  phone: "+92 300 0000000",
  address: {
    line1: "KHZR Studio",
    line2: "",
    city: "Lahore",
    region: "Punjab",
    postalCode: "54000",
    country: "PK",
  },
  social: {
    instagram: "https://instagram.com",
    pinterest: "https://pinterest.com",
  },
  freeShippingThreshold: 6000,
  shippingNote: "Complimentary shipping on eligible Pakistan orders",
  currency: "PKR",
} as const

export const NAV_LINKS = [
  { label: "New Arrivals", href: "/collection/new-arrivals" },
  { label: "Ready to Wear", href: "/collection/ready-to-wear" },
  { label: "Printed Pret", href: "/collection/printed-pret" },
  { label: "Embroidered Pret", href: "/collection/embroidered-pret" },
] as const

export const FOOTER_LINKS = {
  house: [
    { label: "About KHZR", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  client: [
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Size & Fit", href: "/size-fit" },
    { label: "Care", href: "/fabric-care" },
  ],
  shop: [
    { label: "New Arrivals", href: "/collection/new-arrivals" },
    { label: "Ready to Wear", href: "/collection/ready-to-wear" },
    { label: "Printed Pret", href: "/collection/printed-pret" },
    { label: "Embroidered Pret", href: "/collection/embroidered-pret" },
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
  standardRate: 250,
  standardLabel: "Pakistan Standard Delivery",
  complimentaryLabel: "Complimentary Pakistan Delivery",
} as const

/** Tax architecture — Pakistan checkout currently treats listed prices as tax-inclusive. */
export const TAX_RATE = 0
export const TAX_LABEL = "Duties & Taxes"

/** Legacy country allow-list retained for non-checkout address integrations. */
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
