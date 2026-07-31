import type { Metadata } from "next"
import { SITE } from "@/lib/constants"

type SeoArgs = {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  noindex?: boolean
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  noindex = false,
}: SeoArgs = {}): Metadata {
  const url = `${SITE.url}${path}`
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: title ?? SITE.name }]
    : undefined

  return {
    title: title
      ? { default: `${title} — ${SITE.name}`, template: `%s — ${SITE.name}` }
      : { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: title ?? SITE.name,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? SITE.name,
      description,
      images,
    },
    robots: { index: !noindex, follow: true },
  }
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    sameAs: Object.values(SITE.social),
  }
}

export function jsonLdProduct(input: {
  name: string
  description?: string | null
  image?: string | null
  price: string
  currency?: string
  sku?: string | null
  url: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  aggregateRating?: { rating: number; count: number }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    image: input.image ?? undefined,
    sku: input.sku ?? undefined,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency ?? SITE.currency,
      url: input.url,
      availability: `https://schema.org/${input.availability ?? "InStock"}`,
    },
    ...(input.aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: input.aggregateRating.rating,
            reviewCount: input.aggregateRating.count,
          },
        }
      : {}),
  }
}

export function jsonLdItemList(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

export function jsonLdBreadcrumbs(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
