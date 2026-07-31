import Link from "next/link"
import { notFound } from "next/navigation"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

const COLLECTIONS: Record<string, { name: string; note: string; description: string }> = {
  tailoring: {
    name: "The Tailoring Room",
    note: "Coats · Suits · Trousers",
    description:
      "Architectural cuts and double-faced cloth. Garments built around the body with a couture pattern archive.",
  },
  essentials: {
    name: "Crafted Essentials",
    note: "Cashmere · Silk · Leather",
    description:
      "The permanent wardrobe: silk-twill shirting, cashmere roll-necks and leather goods worn daily.",
  },
  evening: {
    name: "The Evening Atelier",
    note: "Gowns in Silk",
    description:
      "Gowns in silk charmeuse and duchesse satin, cut for the hour between dusk and midnight.",
  },
  archive: {
    name: "Atelier Archive",
    note: "Numbered Reissues",
    description:
      "Limited pieces from past ateliers, reissued in small numbers. Numbered, never repeated.",
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

  return (
    <>
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
