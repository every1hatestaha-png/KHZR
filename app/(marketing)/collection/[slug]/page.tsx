import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { CollectionTracker } from "@/components/analytics/event-trackers"
import {
  buildMetadata,
  jsonLdBreadcrumbs,
  jsonLdCollection,
  jsonLdScript,
} from "@/lib/seo"
import { getLaunchCollection, ALL_COLLECTIONS } from "@/lib/launch-collections"
import { getProductsByCollection } from "@/lib/data-access/site"

export function generateStaticParams() {
  return ALL_COLLECTIONS.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getLaunchCollection(slug)
  if (!collection) return {}
  return buildMetadata({
    title: collection.name,
    description: collection.description,
    path: `/collection/${slug}`,
    image: collection.imageUrl,
  })
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; filter?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const collection = getLaunchCollection(slug)
  if (!collection) notFound()
  const products = await getProductsByCollection(slug)

  const breadcrumbLd = jsonLdBreadcrumbs([
    { name: "Ready to Wear", url: "/collections" },
    { name: collection.name, url: `/collection/${slug}` },
  ])
  const collectionLd = jsonLdCollection({
    name: collection.name,
    description: collection.description,
    url: `/collection/${slug}`,
    image: collection.imageUrl,
  })

  return (
    <>
      <CollectionTracker slug={slug} name={collection.name} sort={query.sort} filter={query.filter} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionLd) }}
      />
      <PageIntro
        kicker={collection.note}
        title={collection.name}
        description={collection.description}
      >
        <Button asChild variant="luxury-link" className="mt-2 self-start">
          <Link href="/collections">All Ready to Wear</Link>
        </Button>
      </PageIntro>

      {collection.legacy ? (
        <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">Legacy link</p>
          <p className="font-display text-3xl font-light leading-tight text-noir lg:text-5xl">Our launch shop is Ready to Wear.</p>
          <Button asChild>
            <Link href="/collections">Shop Ready to Wear</Link>
          </Button>
        </section>
      ) : products.length > 0 ? (
        <section className="mx-auto max-w-[1400px] border-t border-hairline px-5 py-16 lg:px-10 lg:py-24">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">Coming soon</p>
          <p className="font-display text-3xl font-light leading-tight text-noir lg:text-5xl">This ready-to-wear edit is being prepared.</p>
          <p className="max-w-md text-sm leading-relaxed text-stone">Products will appear here after launch catalog import and collection assignment.</p>
        </section>
      )}
    </>
  )
}
