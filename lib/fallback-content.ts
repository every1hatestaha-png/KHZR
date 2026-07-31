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

export const FALLBACK_CAMPAIGNS: FallbackCampaign[] = [
  {
    kicker: "Summer — Lawn Collection",
    title: "Elegance in Bloom",
    subtitle:
      "A celebration of intricate embroidery, delicate lace borders, and fine lawn prints for the modern wardrobe.",
    ctaLabel: "Explore the Collection",
    ctaHref: "/collections",
    imageUrl: img("1515886657613-9f3515b0c78f", 2400),
  },
  {
    kicker: "The Atelier",
    title: "Chiffon & Organza",
    subtitle:
      "Hand-finished lace details, printed silk dupattas, and timeless luxury silhouettes.",
    ctaLabel: "View Atelier",
    ctaHref: "/collection/evening",
    imageUrl: img("1469334031218-e382a71b716b", 2000),
  },
]

export const FALLBACK_FEATURED: FallbackCard[] = [
  {
    slug: "ivory-butterfly-embroidered-suit",
    name: "Ivory Butterfly Embroidered Lawn",
    subtitle: "Monochrome floral print with butterfly lace embroidery and printed chiffon dupatta",
    price: "8950",
    compareAtPrice: null,
    imageUrl: img("1515372039744-b8f02a3ae446"),
    isNew: true,
  },
]