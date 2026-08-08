import type { MetadataRoute } from "next"
import { SITE } from "@/lib/constants"
import { getLaunchCollection } from "@/lib/launch-collections"
import { isDatabaseConfigured } from "@/lib/services/cart-service"

const STATIC_ROUTES = [
  "",
  "/collections",
  "/collection/new-arrivals",
  "/collection/ready-to-wear",
  "/about",
  "/contact",
  "/shipping-returns",
  "/size-fit",
  "/fabric-care",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }))

  if (isDatabaseConfigured()) {
    try {
      const { prisma } = await import("@/lib/prisma")
      const [products, collections] = await Promise.all([
        prisma.product.findMany({
          where: { status: "ACTIVE" },
          select: { slug: true, updatedAt: true },
        }),
        prisma.collection.findMany({
          where: { publishedAt: { not: null } },
          select: { slug: true, updatedAt: true },
        }),
      ])

      routes.push(
        ...products.map((p) => ({
          url: `${SITE.url}/product/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      )

      // Only indexable launch collections belong in the sitemap. Legacy
      // redirect collections (which render as noindex compatibility pages)
      // are excluded even when the database row is marked published.
      for (const c of collections) {
        const launch = getLaunchCollection(c.slug)
        if (!launch || launch.legacy) continue
        routes.push({
          url: `${SITE.url}/collection/${c.slug}`,
          lastModified: c.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      }
    } catch {
      // Database unreachable — publish static routes only. Product and
      // collection URLs are never synthesised from a hardcoded catalogue.
    }
  }

  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>()
  for (const route of routes) byUrl.set(route.url, route)

  return [...byUrl.values()]
}
