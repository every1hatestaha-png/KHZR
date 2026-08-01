import Link from "next/link"
import { notFound } from "next/navigation"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import {
  buildMetadata,
  jsonLdBreadcrumbs,
  jsonLdCollection,
  jsonLdScript,
} from "@/lib/seo"

const COLLECTIONS: Record<
  string,
  { name: string; note: string; description: string; imageUrl: string }
> = {
  tailoring: {
    name: "Tailoring",
    note: "Coats · Suits · Trousers",
    description:
      "Sharp cuts and structured cloth. Pieces built around the line of the body.",
    imageUrl:
      "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=1600&q=80",
  },
  essentials: {
    name: "Essentials",
    note: "Cashmere · Silk · Leather",
    description:
      "The permanent wardrobe: shirting, knits, and pieces made for repeat wear.",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80",
  },
  evening: {
    name: "Evening",
    note: "Gowns in Silk",
    description:
      "Longer lines, fluid fabric, and pieces cut for late rooms.",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
  },
  archive: {
    name: "Archive",
    note: "Numbered Reissues",
    description:
      "Limited pieces from past releases, returned in small numbers.",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80",
  },
}

export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = COLLECTIONS[slug]
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
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = COLLECTIONS[slug]
  if (!collection) notFound()

  const breadcrumbLd = jsonLdBreadcrumbs([
    { name: "Collections", url: "/collections" },
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
          <Link href="/collections">All Collections</Link>
        </Button>
      </PageIntro>

      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
          Catalogue coming soon
        </p>
        <p className="font-display text-3xl font-light leading-tight text-noir lg:text-5xl">
          This edit is being prepared.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          {collection.name} will open here with product imagery, available
          sizes, and the filters needed to move through the edit quickly.
        </p>
      </section>
    </>
  )
}
