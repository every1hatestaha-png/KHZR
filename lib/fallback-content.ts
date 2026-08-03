const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export type FallbackCampaign = {
  kicker: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
}

export type FallbackCard = {
  slug: string
  name: string
  subtitle: string
  price: string
  compareAtPrice: string | null
  imageUrl: string
  isNew: boolean
}

export type FallbackVariant = {
  id: string
  size: string
  color: string
  colorHex: string
  stock: number
}

export type FallbackProduct = {
  slug: string
  name: string
  subtitle: string
  description: string
  composition: string
  care: string
  price: string
  compareAtPrice: string | null
  currency: string
  isNew: boolean
  isFeatured: boolean
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER"
  collectionSlug: string
  collectionName: string
  sku: string
  images: string[]
  variants: FallbackVariant[]
}

export const FALLBACK_CAMPAIGNS: FallbackCampaign[] = [
  {
    kicker: "Ready to Wear",
    title: "Eastern dresses for launch.",
    subtitle:
      "Printed Pret and Embroidered Pret for women in Pakistan, priced in PKR.",
    ctaLabel: "Shop New Arrivals",
    ctaHref: "/collection/new-arrivals",
    imageUrl: img("1515886657613-9f3515b0c78f", 2400),
  },
  {
    kicker: "Embroidered Pret",
    title: "Detail work, ready to wear.",
    subtitle:
      "Product pages show fabric, work type, included pieces, care, and size notes when provided.",
    ctaLabel: "Shop Embroidered Pret",
    ctaHref: "/collection/embroidered-pret",
    imageUrl: img("1469334031218-e382a71b716b", 2000),
  },
]

/* ── Colourways ─────────────────────────────────────────────────── */
const COLORS: Record<string, string> = {
  Noir: "#121110",
  Oat: "#d9cebd",
  Ivory: "#f3eee6",
  Champagne: "#c2a878",
  Sand: "#e4dccd",
  Stone: "#5c5248",
}

const APP_SIZES = ["S", "M", "L"]

const productImage = (path: string) => path

function makeVariants(
  slug: string,
  colorways: (keyof typeof COLORS)[],
  sizes: string[],
  stockPlan: number[]
): FallbackVariant[] {
  const list: FallbackVariant[] = []
  let i = 0
  for (const color of colorways) {
    for (const size of sizes) {
      list.push({
        id: `fb-${slug}-${color.toLowerCase()}-${size.toLowerCase()}`,
        size,
        color,
        colorHex: COLORS[color],
        stock: stockPlan[i % stockPlan.length],
      })
      i++
    }
  }
  return list
}

/* ── Safe fallback catalogue for launch when database products are unavailable. */
const PRODUCTS: Array<{
  slug: string
  name: string
  subtitle: string
  description: string
  composition: string
  care: string
  price: string
  compareAtPrice?: string
  isNew?: boolean
  isFeatured?: boolean
  stockStatus?: FallbackProduct["stockStatus"]
  collectionSlug: string
  sku: string
  colorways: (keyof typeof COLORS)[]
  sizes: string[]
  media: string[]
  stockPlan: number[]
}> = [
  {
    slug: "ivory-bloom",
    name: "Ivory Bloom",
    subtitle: "Eastern ready-to-wear placeholder",
    description:
      "A restrained ready-to-wear eastern dress placeholder. Final fabric, work, and included pieces should be confirmed by the owner before launch.",
    composition: "Fabric details pending owner confirmation",
    care: "Follow the care label attached to the garment.",
    price: "5500.00",
    isNew: true,
    isFeatured: true,
    collectionSlug: "new-arrivals",
    sku: "KHZR-IVORY-BLOOM",
    colorways: ["Ivory"],
    sizes: APP_SIZES,
    media: ["/image/products/Ivory%20Butterfly%20Embroidered%20Lawn.jpeg"],
    stockPlan: [4, 6, 5],
  },
  {
    slug: "slate-garden",
    name: "Slate Garden",
    subtitle: "Printed Pret placeholder",
    description:
      "A restrained Printed Pret placeholder for launch browsing. Final fabric, work, and included pieces should be confirmed by the owner before launch.",
    composition: "Fabric details pending owner confirmation",
    care: "Follow the care label attached to the garment.",
    price: "4500.00",
    isNew: true,
    isFeatured: true,
    collectionSlug: "printed-pret",
    sku: "KHZR-SLATE-GARDEN",
    colorways: ["Stone"],
    sizes: APP_SIZES,
    media: ["/image/products/Slate%20Grey%20Floral%20Printed%20Lawn.jpeg"],
    stockPlan: [5, 6, 4],
  },
  {
    slug: "noir-petal",
    name: "Noir Petal",
    subtitle: "Embroidered Pret placeholder",
    description:
      "A restrained Embroidered Pret placeholder for launch browsing. Final fabric, embroidery, and included pieces should be confirmed by the owner before launch.",
    composition: "Fabric details pending owner confirmation",
    care: "Follow the care label attached to the garment.",
    price: "6000.00",
    isFeatured: true,
    collectionSlug: "embroidered-pret",
    sku: "KHZR-NOIR-PETAL",
    colorways: ["Noir"],
    sizes: APP_SIZES,
    media: ["/image/products/Midnight%20Black%20Embroidered%20Suit.jpeg"],
    stockPlan: [3, 5, 4],
  },
  {
    slug: "azure-flora",
    name: "Azure Flora",
    subtitle: "Printed Pret placeholder",
    description:
      "A restrained Printed Pret placeholder for launch browsing. Final fabric, work, and included pieces should be confirmed by the owner before launch.",
    composition: "Fabric details pending owner confirmation",
    care: "Follow the care label attached to the garment.",
    price: "5000.00",
    isNew: true,
    isFeatured: true,
    collectionSlug: "printed-pret",
    sku: "KHZR-AZURE-FLORA",
    colorways: ["Champagne"],
    sizes: APP_SIZES,
    media: ["/image/products/Sky%20Blue%20Printed%20Floral%20Set.jpeg"],
    stockPlan: [4, 7, 5],
  },
  {
    slug: "verdant-line",
    name: "Verdant Line",
    subtitle: "Ready to Wear placeholder",
    description:
      "A restrained ready-to-wear eastern dress placeholder. Final fabric, work, and included pieces should be confirmed by the owner before launch.",
    composition: "Fabric details pending owner confirmation",
    care: "Follow the care label attached to the garment.",
    price: "5200.00",
    isFeatured: true,
    collectionSlug: "ready-to-wear",
    sku: "KHZR-VERDANT-LINE",
    colorways: ["Stone"],
    sizes: APP_SIZES,
    media: ["/image/products/Deep%20Teal%20Vintage%20Floral%20Lawn.jpeg"],
    stockPlan: [5, 5, 4],
  },
]

const COLLECTION_NAMES: Record<string, string> = {
  "new-arrivals": "New Arrivals",
  "ready-to-wear": "Ready to Wear",
  "printed-pret": "Printed Pret",
  "embroidered-pret": "Embroidered Pret",
  archive: "Sale",
}

export const FALLBACK_PRODUCTS: FallbackProduct[] = PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  subtitle: p.subtitle,
  description: p.description,
  composition: p.composition,
  care: p.care,
  price: p.price,
  compareAtPrice: p.compareAtPrice ?? null,
  currency: "PKR",
  isNew: p.isNew ?? false,
  isFeatured: p.isFeatured ?? false,
  stockStatus: p.stockStatus ?? "IN_STOCK",
  collectionSlug: p.collectionSlug,
  collectionName: COLLECTION_NAMES[p.collectionSlug] ?? p.collectionSlug,
  sku: p.sku,
  images: p.media.map((path) => productImage(path)),
  variants: makeVariants(p.slug, p.colorways, p.sizes, p.stockPlan),
}))

export function getFallbackProduct(slug: string): FallbackProduct | null {
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null
}

/* ── Homepage rail — derived from the catalogue ─────────────────── */
const FEATURED_SLUGS = [
  "ivory-bloom",
  "slate-garden",
  "noir-petal",
  "azure-flora",
  "verdant-line",
]

export const FALLBACK_FEATURED: FallbackCard[] = FEATURED_SLUGS.map((slug) => {
  const p = getFallbackProduct(slug)!
  return {
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.images[0],
    isNew: p.isNew,
  }
})

