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

const APP_SIZES = ["XS", "S", "M", "L", "XL"]
const SHOE_SIZES = ["35", "36", "37", "38", "39", "40"]

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

/* ── The catalogue (mirrors prisma/seed.ts) ─────────────────────── */
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
    slug: "slate-wool-overcoat",
    name: "The Slate Wool Overcoat",
    subtitle: "Fulling-needle wool, cut long and clean",
    description:
      "A single-button overcoat in fulling-needle wool. The sleeve head is softly rounded; the silhouette falls from the shoulder without a seam across the back. Finished with horn buttons and a deep throat latch.",
    composition: "100% virgin wool · horn buttons · cupro lining",
    care: "Dry clean only. Hang on a broad-shouldered hanger.",
    price: "1850.00",
    isNew: true,
    collectionSlug: "tailoring",
    sku: "KHZR-COAT-SLATE",
    colorways: ["Noir", "Oat"],
    sizes: APP_SIZES,
    media: ["1515372039744-b8f02a3ae446", "1537832816519-689ad163238b", "1503341504253-dff4815485f1"],
    stockPlan: [12, 8, 20, 5, 14, 9, 11, 3, 16, 7],
  },
  {
    slug: "ivory-butterfly-embroidered-suit",
    name: "Ivory Butterfly Embroidered Lawn",
    subtitle: "Monochrome floral print with lace detail and chiffon dupatta",
    description:
      "A three-piece lawn set with a monochrome floral print, lace detail, and printed chiffon dupatta. Cut for ease and lined in cotton.",
    composition: "100% lawn cotton · printed chiffon dupatta",
    care: "Dry clean only. Cool iron.",
    price: "8950.00",
    isNew: true,
    collectionSlug: "tailoring",
    sku: "KHZR-LAWN-BUTTERFLY",
    colorways: ["Ivory", "Sand"],
    sizes: APP_SIZES,
    media: ["1515372039744-b8f02a3ae446", "1467043237213-65f2da53396f", "1521577352947-9bb58764b69a"],
    stockPlan: [8, 5, 10, 4, 7, 6, 9, 3, 5, 8],
  },
  {
    slug: "structured-oversized-blazer",
    name: "Structured Oversized Blazer",
    subtitle: "Soft construction, decisive shoulder",
    description:
      "An oversized blazer with a softly padded shoulder and a straight, un-pinched waist. Cut from wool twill with a half-canvas front for shape without stiffness.",
    composition: "98% wool · 2% elastane · viscose lining",
    care: "Dry clean only.",
    price: "1240.00",
    collectionSlug: "tailoring",
    sku: "KHZR-BLAZER-STRUCT",
    colorways: ["Noir", "Stone"],
    sizes: APP_SIZES,
    media: ["1537832816519-689ad163238b", "1503341504253-dff4815485f1", "1434389677669-e08b4cac3105"],
    stockPlan: [6, 10, 18, 4, 9, 12, 7, 15, 2, 8],
  },
  {
    slug: "double-faced-tailored-trousers",
    name: "Double-Faced Tailored Trousers",
    subtitle: "Flat front, clean break",
    description:
      "Double-faced wool trousers cut with a flat front and a single pressed crease. The waistband is finished with a grosgrain facing; hems are left unsewn for personal adjustment.",
    composition: "100% double-faced wool",
    care: "Dry clean only. Steam rather than press.",
    price: "620.00",
    collectionSlug: "tailoring",
    sku: "KHZR-TROU-DOUBLE",
    colorways: ["Oat", "Noir"],
    sizes: APP_SIZES,
    media: ["1434389677669-e08b4cac3105", "1467043237213-65f2da53396f", "1496747611176-843222e1e57c"],
    stockPlan: [14, 9, 22, 6, 11, 13, 8, 17, 4, 10],
  },
  {
    slug: "hand-finished-trench-coat",
    name: "Cotton Gabardine Trench Coat",
    subtitle: "Balmacaan lines, English cotton gabardine",
    description:
      "A trench cut on Balmacaan lines from dense cotton gabardine. Raglan shoulder, horn storm flap, and a fly front that closes on concealed buttons. The belt is cut on the bias and lies flat against the waist.",
    composition: "100% cotton gabardine · horn buttons",
    care: "Dry clean only.",
    price: "1590.00",
    isFeatured: true,
    collectionSlug: "tailoring",
    sku: "KHZR-TRENCH-HAND",
    colorways: ["Sand", "Oat"],
    sizes: APP_SIZES,
    media: ["1490481651871-ab68de25d43d", "1509631179647-0177331693ae", "1503341504253-dff4815485f1"],
    stockPlan: [9, 12, 16, 5, 10, 14, 7, 11, 3, 6],
  },
  {
    slug: "pinstriped-peak-lapel-suit",
    name: "Pinstriped Peak-Lapel Suit",
    subtitle: "Two pieces, one drawing",
    description:
      "A two-piece suit in fine pinstriped wool with a peak lapel and a gently extended shoulder. Trousers cut with a double pleat and a fuller leg. Wear together or split across the week.",
    composition: "100% wool · cupro lining",
    care: "Dry clean only.",
    price: "2100.00",
    isFeatured: true,
    collectionSlug: "tailoring",
    sku: "KHZR-SUIT-PEAK",
    colorways: ["Noir", "Stone"],
    sizes: APP_SIZES,
    media: ["1503341504253-dff4815485f1", "1537832816519-689ad163238b", "1496747611176-843222e1e57c"],
    stockPlan: [5, 7, 12, 4, 8, 9, 6, 10, 2, 5],
  },
  {
    slug: "ivory-silk-twill-shirt",
    name: "Ivory Silk-Twill Shirt",
    subtitle: "Mulberry silk, mother-of-pearl buttons",
    description:
      "A shirting in mulberry silk twill with a camp collar and mother-of-pearl buttons. The hem falls long enough to wear untucked; the sleeve is cut from a single piece of cloth.",
    composition: "100% mulberry silk",
    care: "Hand wash cold. Do not tumble dry.",
    price: "390.00",
    isNew: true,
    collectionSlug: "essentials",
    sku: "KHZR-SHIRT-IVORY",
    colorways: ["Ivory", "Oat"],
    sizes: APP_SIZES,
    media: ["1521577352947-9bb58764b69a", "1467043237213-65f2da53396f", "1503341504253-dff4815485f1"],
    stockPlan: [18, 12, 24, 8, 15, 20, 10, 16, 6, 12],
  },
  {
    slug: "cashmere-roll-neck-sweater",
    name: "Cashmere Roll-Neck Sweater",
    subtitle: "Two-ply Mongolian cashmere",
    description:
      "A roll-neck in two-ply Mongolian cashmere, knitted on a fine gauge and washed until it drapes. Ribbed at the hem and cuffs, and cut with a slightly dropped shoulder for an unconstructed ease.",
    composition: "100% Mongolian cashmere",
    care: "Hand wash in cold water with wool wash. Dry flat.",
    price: "780.00",
    compareAtPrice: "890.00",
    isNew: true,
    isFeatured: true,
    collectionSlug: "essentials",
    sku: "KHZR-KNIT-ROLLNECK",
    colorways: ["Oat", "Noir"],
    sizes: APP_SIZES,
    media: ["1517841905240-472988babdf9", "1496747611176-843222e1e57c", "1467043237213-65f2da53396f"],
    stockPlan: [10, 14, 20, 7, 12, 16, 9, 13, 4, 8],
  },
  {
    slug: "knitted-silk-shell",
    name: "Knitted Silk Shell",
    subtitle: "A second skin in silk",
    description:
      "A knitted silk shell that follows the body without clinging. Ribbed throughout, with a narrow neckline that stays in place. Worn under tailoring or alone.",
    composition: "100% silk",
    care: "Hand wash cold. Dry flat.",
    price: "340.00",
    collectionSlug: "essentials",
    sku: "KHZR-SHELL-SILK",
    colorways: ["Ivory", "Champagne"],
    sizes: APP_SIZES,
    media: ["1467043237213-65f2da53396f", "1521577352947-9bb58764b69a", "1490481651871-ab68de25d43d"],
    stockPlan: [15, 10, 19, 6, 13, 17, 8, 14, 5, 9],
  },
  {
    slug: "leather-slide-sandal",
    name: "Leather Slide Sandal",
    subtitle: "Vegetable-tanned leather, sculpted sole",
    description:
      "A slide in vegetable-tanned leather with a sculpted cork-and-leather sole. The wide strap holds the foot cleanly and softens with wear.",
    composition: "Vegetable-tanned calf leather · cork sole",
    care: "Wipe clean. Avoid prolonged water exposure.",
    price: "450.00",
    collectionSlug: "essentials",
    sku: "KHZR-SLIDE-LEATHER",
    colorways: ["Stone", "Noir"],
    sizes: SHOE_SIZES,
    media: ["1445205170230-053b83016050", "1467043237213-65f2da53396f", "1509631179647-0177331693ae"],
    stockPlan: [11, 8, 14, 5, 9, 12, 7, 10, 4, 6],
  },
  {
    slug: "column-evening-dress",
    name: "Column Evening Dress",
    subtitle: "Silk charmeuse, cut on the bias",
    description:
      "A column dress in silk charmeuse cut entirely on the bias so it falls in a single liquid line. The neckline is traced with a hand-rolled edge; the back closes on a concealed zip.",
    composition: "100% silk charmeuse",
    care: "Dry clean only.",
    price: "2400.00",
    isFeatured: true,
    collectionSlug: "evening",
    sku: "KHZR-DRESS-COLUMN",
    colorways: ["Noir", "Champagne"],
    sizes: APP_SIZES,
    media: ["1490114538077-0a7f8cb49891", "1469334031218-e382a71b716b", "1487222477894-8943e31ef7b2"],
    stockPlan: [4, 6, 9, 3, 5, 7, 4, 8, 2, 5],
  },
  {
    slug: "silk-charmeuse-gown",
    name: "Silk Charmeuse Gown",
    subtitle: "One strap, low hip seam",
    description:
      "A floor-length gown in silk charmeuse with a single strap and a low hip seam. The skirt falls in a soft line from the body.",
    composition: "100% silk charmeuse",
    care: "Dry clean only.",
    price: "2950.00",
    isNew: true,
    stockStatus: "LOW_STOCK",
    collectionSlug: "evening",
    sku: "KHZR-GOWN-CHARM",
    colorways: ["Champagne", "Ivory"],
    sizes: APP_SIZES,
    media: ["1469334031218-e382a71b716b", "1490114538077-0a7f8cb49891", "1490481651871-ab68de25d43d"],
    stockPlan: [2, 3, 5, 2, 4, 3, 6, 2, 1, 3],
  },
  {
    slug: "archival-long-line-vest",
    name: "Long-Line Wool Vest",
    subtitle: "High neck, extended line",
    description:
      "A long-line vest cut from double-faced wool with a high, notched neck. Wear over shirting or directly against the body.",
    composition: "100% double-faced wool · cupro lining",
    care: "Dry clean only.",
    price: "890.00",
    stockStatus: "OUT_OF_STOCK",
    collectionSlug: "archive",
    sku: "KHZR-ARCHIVE-VEST",
    colorways: ["Noir", "Oat"],
    sizes: APP_SIZES,
    media: ["1485968579580-b6d095142e6e", "1503341504253-dff4815485f1", "1537832816519-689ad163238b"],
    stockPlan: [3, 2, 5, 1, 3, 4, 2, 5, 1, 2],
  },
]

const COLLECTION_NAMES: Record<string, string> = {
  tailoring: "Ready to Wear",
  essentials: "Printed Pret",
  evening: "Embroidered Pret",
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
  images: p.media.map((id) => img(id)),
  variants: makeVariants(p.slug, p.colorways, p.sizes, p.stockPlan),
}))

export function getFallbackProduct(slug: string): FallbackProduct | null {
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null
}

/* ── Homepage rail — derived from the catalogue ─────────────────── */
const FEATURED_SLUGS = [
  "slate-wool-overcoat",
  "hand-finished-trench-coat",
  "cashmere-roll-neck-sweater",
  "column-evening-dress",
  "pinstriped-peak-lapel-suit",
  "ivory-silk-twill-shirt",
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

