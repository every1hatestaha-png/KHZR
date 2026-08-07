export type LaunchCollection = {
  slug: string
  name: string
  note: string
  description: string
  imageUrl: string
  primary: boolean
  legacy?: boolean
}

const IMAGES = {
  newArrivals:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
  readyToWear:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  sale: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80",
}

export const LAUNCH_COLLECTIONS: LaunchCollection[] = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    note: "Fresh ready-to-wear pieces",
    description: "The latest KHZR ready-to-wear eastern dresses for women in Pakistan.",
    imageUrl: IMAGES.newArrivals,
    primary: true,
  },
  {
    slug: "ready-to-wear",
    name: "Ready to Wear",
    note: "Eastern dresses in S, M, L",
    description: "Ready-to-wear eastern dresses in a launch price range of PKR 4,000 to PKR 6,000.",
    imageUrl: IMAGES.readyToWear,
    primary: true,
  },
  {
    slug: "sale",
    name: "Sale",
    note: "Selected markdowns",
    description: "Sale ready-to-wear pieces appear here when markdown products are available.",
    imageUrl: IMAGES.sale,
    primary: false,
  },
]

export const LEGACY_COLLECTIONS: LaunchCollection[] = [
  {
    slug: "tailoring",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: IMAGES.readyToWear,
    primary: false,
    legacy: true,
  },
  {
    slug: "essentials",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: IMAGES.readyToWear,
    primary: false,
    legacy: true,
  },
  {
    slug: "evening",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: IMAGES.readyToWear,
    primary: false,
    legacy: true,
  },
  {
    slug: "archive",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link is retained for compatibility and is not part of launch navigation.",
    imageUrl: IMAGES.readyToWear,
    primary: false,
    legacy: true,
  },
  {
    slug: "printed-pret",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: IMAGES.readyToWear,
    primary: false,
    legacy: true,
  },
  {
    slug: "embroidered-pret",
    name: "Ready to Wear",
    note: "Legacy link",
    description: "This legacy collection link now points shoppers toward KHZR ready-to-wear eastern dresses.",
    imageUrl: IMAGES.readyToWear,
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
