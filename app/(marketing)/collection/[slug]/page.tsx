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
    name: "The Tailoring Room",
    note: "Coats · Suits · Trousers",
    description:
      "Architectural cuts and double-faced cloth. Garments built around the body with a couture pattern archive.",
    imageUrl:
      "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=1600&q=80",
  },
  essentials: {
    name: "Crafted Essentials",
    note: "Cashmere · Silk · Leather",
    description:
      "The permanent wardrobe: silk-twill shirting, cashmere roll-necks and leather goods worn daily.",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80",
  },
  evening: {
    name: "The Evening Atelier",
    note: "Gowns in Silk",
    description:
      "Gowns in silk charmeuse and duchesse satin, cut for the hour between dusk and midnight.",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
  },
  archive: {
    name: "Atelier Archive",
    note: "Numbered Reissues",
    description:
      "Limited pieces from past ateliers, reissued in small numbers. Numbered, never repeated.",
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

      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          The collection is being dressed.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-taupe">
          {collection.name} opens with the full catalogue — pieces, sizes and
          the campaign imagery that defines the room.
        </p>
      </section>
    </>
  )
}
