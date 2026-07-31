import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductBuybox } from "@/components/product/product-buybox"
import { ProductCard } from "@/components/product/product-card"
import { ProductGallery } from "@/components/product/product-gallery"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeading } from "@/components/shared/section-heading"
import { buildMetadata, jsonLdProduct } from "@/lib/seo"
import { SITE } from "@/lib/constants"
import { getProductBySlug, getRelatedProducts } from "@/lib/data-access/site"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) {
    return buildMetadata({ title: "Product", path: `/product/${slug}`, noindex: true })
  }
  return buildMetadata({
    title: product.name,
    description: product.subtitle ?? product.description,
    path: `/product/${product.slug}`,
    image: product.images[0],
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.slug, product.collectionSlug, 4)
  const available = product.variants.some((v) => v.stock > 0)
  const jsonLd = jsonLdProduct({
    name: product.name,
    description: product.description,
    image: product.images[0],
    price: product.price.toFixed(2),
    currency: product.currency,
    sku: product.sku,
    url: `${SITE.url}/product/${product.slug}`,
    availability: available ? "InStock" : "OutOfStock",
  })

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
            <li>
              <Link
                href="/collections"
                className="transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
              >
                Collections
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link
                href={`/collection/${product.collectionSlug}`}
                className="transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
              >
                {product.collectionName}
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li aria-current="page" className="text-noir">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <ProductGallery images={product.images} alt={product.name} />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <ProductBuybox product={product} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
            <SectionHeading
              kicker="Continue"
              title="You May Also Like"
              description="Pieces from the same atelier, cut from the same cloth and the same conviction."
            />
            <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
              {related.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 4) * 0.08} y={32}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
