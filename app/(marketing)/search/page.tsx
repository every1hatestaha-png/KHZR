import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SearchTracker } from "@/components/analytics/event-trackers"
import { ProductCard } from "@/components/product/product-card"
import { SearchForm } from "@/components/search/search-form"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { searchProducts } from "@/lib/data-access/site"
import { buildMetadata } from "@/lib/seo"

const SUGGESTIONS = [
  { label: "Ready to Wear", href: "/collection/ready-to-wear" },
  { label: "Printed Pret", href: "/collection/printed-pret" },
  { label: "Embroidered Pret", href: "/collection/embroidered-pret" },
  { label: "New Arrivals", href: "/collection/new-arrivals" },
]

export const metadata = buildMetadata({
  title: "Search",
  description: "Search KHZR ready-to-wear eastern dresses.",
  path: "/search",
  noindex: true,
})

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams
  const { query, products, error } = await searchProducts(params.q)
  const hasQuery = query.length > 0

  return (
    <>
      <SearchTracker term={hasQuery ? query : null} resultCount={products.length} />
      <section className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.34em] text-taupe">
            Search
          </p>
          <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] tracking-tight text-noir sm:text-6xl">
            Find a piece.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone sm:text-base">
            Search by product name, color, fabric, work type, SKU, or ready-to-wear collection.
          </p>
        </div>

        <div className="mt-10">
          <SearchForm query={query} />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2" aria-label="Suggested searches">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-hairline bg-ivory/45 px-4 py-2 text-[0.625rem] font-medium uppercase tracking-[0.22em] text-taupe transition-colors hover:border-stone hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline bg-background" aria-live="polite" aria-atomic="true">
        <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10 lg:py-20">
          {error ? (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-3xl font-light text-noir">Search is unavailable right now.</p>
              <p className="mt-4 text-sm leading-relaxed text-stone">Browse Ready to Wear while we reconnect to the catalogue.</p>
              <Button asChild variant="luxury-link" className="mt-8">
                <Link href="/collection/ready-to-wear">
                  Shop Ready to Wear
                  <ArrowRight className="ml-3 size-3.5" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : !hasQuery ? (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-3xl font-light text-noir">Search by product name, color, fabric, or collection.</p>
              <p className="mt-4 text-sm leading-relaxed text-stone">Try Ready to Wear, Printed Pret, Embroidered Pret, or a colour from the launch edit.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-3xl font-light text-noir">No pieces found for &lsquo;{query}&rsquo;.</p>
              <p className="mt-4 text-sm leading-relaxed text-stone">Try another fabric, colour, or collection.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild variant="luxury-link">
                  <Link href="/collection/new-arrivals">
                    New Arrivals
                    <ArrowRight className="ml-3 size-3.5" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="luxury-link">
                  <Link href="/collection/ready-to-wear">
                    Ready to Wear
                    <ArrowRight className="ml-3 size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
                    {products.length} {products.length === 1 ? "result" : "results"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-light text-noir sm:text-4xl">
                    Search results for &lsquo;{query}&rsquo;
                  </h2>
                </div>
              </div>
              <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
                {products.map((product, index) => (
                  <Reveal as="li" key={product.slug} delay={(index % 4) * 0.06} y={28}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  )
}
