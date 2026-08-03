import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import type { ProductCardDTO } from "@/lib/data-access/site"

export function ProductRail({
  products,
  kicker = "New Arrivals",
  title = "Ready-to-wear eastern dresses",
  actionHref = "/collection/new-arrivals",
  actionLabel = "View New Arrivals",
}: {
  products: ProductCardDTO[]
  kicker?: string
  title?: string
  actionHref?: string
  actionLabel?: string
}) {
  const visibleProducts = products.slice(0, 8)

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading kicker={kicker} title={title} />
        <Button asChild variant="luxury-link" className="hidden shrink-0 sm:inline-flex">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-3 size-3.5" />
          </Link>
        </Button>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
        {visibleProducts.map((product, i) => (
          <Reveal as="li" key={product.slug} delay={(i % 4) * 0.08} y={32}>
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
