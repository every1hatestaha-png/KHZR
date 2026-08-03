import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import type { ProductCardDTO } from "@/lib/data-access/site"

export function ProductRail({
  products,
  kicker,
  title = "NEW ARRIVALS",
  actionHref = "/collection/new-arrivals",
  actionLabel = "VIEW ALL",
}: {
  products: ProductCardDTO[]
  kicker?: string
  title?: string
  actionHref?: string
  actionLabel?: string
}) {
  const visibleProducts = products.slice(0, 5)

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
      <div className="flex items-center justify-between gap-6 border-b border-hairline pb-5">
        <div className="flex flex-col gap-2">
          {kicker ? (
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-taupe">
              {kicker}
            </p>
          ) : null}
          <h2 className="text-[0.75rem] font-medium uppercase tracking-[0.32em] text-noir">
            {title}
          </h2>
        </div>
        <Button asChild variant="luxury-link" className="hidden shrink-0 text-[0.6875rem] tracking-[0.28em] sm:inline-flex">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-3 size-3.5" />
          </Link>
        </Button>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-16">
        {visibleProducts.map((product, i) => (
          <Reveal as="li" key={product.slug} delay={(i % 5) * 0.06} y={28}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </ul>

      <div className="mt-12 text-center sm:hidden">
        <Button asChild variant="luxury-link">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-3 size-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
