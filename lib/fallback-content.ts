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
    kicker: "Autumn — Winter MMXXVI",
    title: "Silhouettes in Monochrome",
    subtitle:
      "A study in restraint — double-faced wool, bias-cut silk and the discipline of a single colour field.",
    ctaLabel: "Explore the Collection",
    ctaHref: "/collections",
    imageUrl: img("1515886657613-9f3515b0c78f", 2400),
  },
  {
    kicker: "The Evening Atelier",
    title: "Dressed in Light",
    subtitle:
      "Champagne silk, hand-rolled edges and the hour between dusk and midnight.",
    ctaLabel: "The Evening Atelier",
    ctaHref: "/collection/evening",
    imageUrl: img("1469334031218-e382a71b716b", 2000),
  },
]

export const FALLBACK_FEATURED: FallbackCard[] = [
  {
    slug: "slate-wool-overcoat",
    name: "The Slate Wool Overcoat",
    subtitle: "Fulling-needle wool, cut long and clean",
    price: "1850",
    compareAtPrice: null,
    imageUrl: img("1515372039744-b8f02a3ae446"),
    isNew: true,
  },
  {
    slug: "hand-finished-trench-coat",
    name: "Hand-Finished Trench Coat",
    subtitle: "Balmacaan lines, English cotton gabardine",
    price: "1590",
    compareAtPrice: null,
    imageUrl: img("1490481651871-ab68de25d43d"),
    isNew: false,
  },
  {
    slug: "cashmere-roll-neck-sweater",
    name: "Cashmere Roll-Neck Sweater",
    subtitle: "Two-ply Mongolian cashmere",
    price: "780",
    compareAtPrice: "890",
    imageUrl: img("1517841905240-472988babdf9"),
    isNew: true,
  },
  {
    slug: "column-evening-dress",
    name: "Column Evening Dress",
    subtitle: "Silk charmeuse, cut on the bias",
    price: "2400",
    compareAtPrice: null,
    imageUrl: img("1490114538077-0a7f8cb49891"),
    isNew: false,
  },
  {
    slug: "pinstriped-peak-lapel-suit",
    name: "Pinstriped Peak-Lapel Suit",
    subtitle: "Two pieces, one drawing",
    price: "2100",
    compareAtPrice: null,
    imageUrl: img("1503341504253-dff4815485f1"),
    isNew: false,
  },
  {
    slug: "ivory-silk-twill-shirt",
    name: "Ivory Silk-Twill Shirt",
    subtitle: "Mulberry silk, mother-of-pearl buttons",
    price: "390",
    compareAtPrice: null,
    imageUrl: img("1521577352947-9bb58764b69a"),
    isNew: true,
  },
]
