export type LaunchCollection = {
  slug: string
  name: string
  note: string
  description: string
  imageUrl: string
  primary: boolean
  legacy?: boolean
}

export const LAUNCH_COLLECTIONS: LaunchCollection[] = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    note: "Fresh ready-to-wear pieces",
    description: "The latest KHZR ready-to-wear eastern dresses for women in Pakistan.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
    primary: true,
  },
  {
    slug: "ready-to-wear",
    name: "Ready to Wear",
    note: "Eastern dresses in S, M, L",
    description: "Ready-to-wear eastern dresses in a launch price range of PKR 4,000 to PKR 6,000.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    primary: true,
  },
  {
    slug: "printed-pret",
    name: "Printed Pret",
    note: "Printed shirts, trousers and dupattas",
    description: "Printed Pret for everyday dressing, including digital prints where product details specify them.",
    imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=80",
    primary: true,
  },
  {
    slug: "embroidered-pret",
    name: "Embroidered Pret",
    note: "Embroidered neckline and detail work",
    description: "Embroidered Pret pieces for women, with work details shown on each product when available.",
    imageUrl: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=1600&q=80",
    primary: true,
  },
  {
    slug: "sale",
    name: "Sale",
    note: "Selected markdowns",
    description: "Sale ready-to-wear pieces appear here when markdown products are available.",
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80",
    primary: false,
  },
]

export const LEGACY_COLLECTIONS: LaunchCollection[] = [
  {
    slug: "tailoring",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: LAUNCH_COLLECTIONS[1].imageUrl,
    primary: false,
    legacy: true,
  },
  {
    slug: "essentials",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: LAUNCH_COLLECTIONS[1].imageUrl,
    primary: false,
    legacy: true,
  },
  {
    slug: "evening",
    name: "Embroidered Pret",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR embroidered ready-to-wear pieces.",
    imageUrl: LAUNCH_COLLECTIONS[3].imageUrl,
    primary: false,
    legacy: true,
  },
  {
    slug: "archive",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link is retained for compatibility and is not part of launch navigation.",
    imageUrl: LAUNCH_COLLECTIONS[1].imageUrl,
    primary: false,
    legacy: true,
  },
]

export const ALL_COLLECTIONS = [...LAUNCH_COLLECTIONS, ...LEGACY_COLLECTIONS]

export function getLaunchCollection(slug: string) {
  return ALL_COLLECTIONS.find((collection) => collection.slug === slug) ?? null
}

export function visibleLaunchCollections() {
  return LAUNCH_COLLECTIONS.filter((collection) => collection.primary)
}
