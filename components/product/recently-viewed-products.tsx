"use client"

import * as React from "react"
import { ProductCard } from "@/components/product/product-card"
import { Reveal } from "@/components/shared/reveal"
import type { ProductCardDTO } from "@/lib/data-access/site"

const STORAGE_KEY = "khzr_recently_viewed"
const MAX_RECENT = 10

function readRecent(): string[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (!value) return []
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}

function writeRecent(currentSlug: string) {
  const next = [currentSlug, ...readRecent().filter((slug) => slug !== currentSlug)].slice(0, MAX_RECENT)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures; recommendations are non-critical.
  }
  return next
}

export function RecentlyViewedProducts({ currentSlug }: { currentSlug: string }) {
  const [products, setProducts] = React.useState<ProductCardDTO[]>([])

  React.useEffect(() => {
    const previous = readRecent().filter((slug) => slug !== currentSlug).slice(0, MAX_RECENT)
    writeRecent(currentSlug)
    if (previous.length < 2) return

    const controller = new AbortController()
    const params = new URLSearchParams({
      slugs: previous.join(","),
      exclude: currentSlug,
    })
    fetch(`/api/recently-viewed?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: ProductCardDTO[] }) => {
        if (Array.isArray(data.products) && data.products.length >= 2) {
          setProducts(data.products.slice(0, 4))
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [currentSlug])

  if (products.length < 2) return null

  return (
    <section className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex items-center justify-between border-b border-hairline pb-5">
          <h2 className="text-[0.75rem] font-medium uppercase tracking-[0.32em] text-noir">
            Recently Viewed
          </h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {products.map((product, index) => (
            <Reveal as="li" key={product.slug} delay={(index % 4) * 0.06} y={28}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
