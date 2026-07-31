import type { MetadataRoute } from "next"
import { SITE } from "@/lib/constants"
import { isDatabaseConfigured } from "@/lib/services/cart-service"

const STATIC_ROUTES = [
  "",
  "/collections",
  "/collection/tailoring",
  "/collection/essentials",
  "/collection/evening",
  "/collection/archive",
  "/lookbook",
  "/journal",
  "/about",
  "/contact",
  "/search",
  "/cart",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }))

  if (isDatabaseConfigured()) {
    const { prisma } = await import("@/lib/prisma")
    const [products, collections, journal, lookbooks] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.collection.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.journalPost.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.lookbook.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ])

    routes.push(
      ...products.map((p) => ({
        url: `${SITE.url}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...collections.map((c) => ({
        url: `${SITE.url}/collection/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...journal.map((j) => ({
        url: `${SITE.url}/journal/${j.slug}`,
        lastModified: j.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...lookbooks.map((l) => ({
        url: `${SITE.url}/lookbook/${l.slug}`,
        lastModified: l.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    )
  }

  return routes
}
