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

/** Absolute URL builder, anchored to the configured metadataBase. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE.url}${path === "/" ? "/" : `/${path.replace(/^\//, "")}`}`
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  image = "/opengraph-image",
  type = "website",
  publishedTime,
  noindex = false,
}: SeoArgs = {}): Metadata {
  const url = absoluteUrl(path)
  const resolvedImage = absoluteUrl(image)

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      title: title ?? `${SITE.name} — ${SITE.tagline}`,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [{ url: resolvedImage, alt: title ?? SITE.name }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? `${SITE.name} — ${SITE.tagline}`,
      description,
      images: [resolvedImage],
    },
    robots: {
      index: !noindex,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  }
}

/**
 * Serializes structured data for an inline JSON-LD script tag, escaping the
 * characters that could otherwise terminate the script element prematurely.
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/icon`,
    },
    slogan: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
  }
}

export function jsonLdWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function jsonLdProduct(input: {
  name: string
  description?: string | null
  image?: string[] | string | null
  price: string
  currency?: string
  sku?: string | null
  url: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  collectionName?: string | null
  aggregateRating?: { rating: number; count: number }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${input.url}#product`,
    name: input.name,
    description: input.description ?? undefined,
    image: Array.isArray(input.image)
      ? input.image
      : input.image
        ? [input.image]
        : undefined,
    sku: input.sku ?? undefined,
    brand: { "@type": "Brand", name: SITE.name },
    category: input.collectionName ?? undefined,
    offers: {
      "@type": "Offer",
      "@id": `${input.url}#offer`,
      price: input.price,
      priceCurrency: input.currency ?? SITE.currency,
      url: input.url,
      availability: `https://schema.org/${input.availability ?? "InStock"}`,
      itemCondition: "https://schema.org/NewCondition",
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

export function jsonLdCollection(input: {
  name: string
  description?: string | null
  url: string
  image?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(input.url)}#collection`,
    name: input.name,
    description: input.description ?? undefined,
    url: absoluteUrl(input.url),
    ...(input.image ? { primaryImageOfPage: { "@type": "ImageObject", url: input.image } } : {}),
    isPartOf: { "@id": `${SITE.url}/#website` },
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
      item: absoluteUrl(item.url),
    })),
  }
}
