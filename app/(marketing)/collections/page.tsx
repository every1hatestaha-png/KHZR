import { PageIntro } from "@/components/shared/page-intro"
import { CollectionCard } from "@/components/collections/collection-card"
import { CollectionTracker } from "@/components/analytics/event-trackers"
import { buildMetadata, jsonLdItemList, jsonLdScript } from "@/lib/seo"
import { SITE } from "@/lib/constants"

const COLLECTIONS = [
  {
    slug: "tailoring",
    name: "Tailoring",
    note: "Coats · Suits · Trousers",
    imageUrl:
      "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=1600&q=80",
    featured: true,
  },
  {
    slug: "essentials",
    name: "Essentials",
    note: "Cashmere · Silk · Leather",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80",
    featured: true,
  },
  {
    slug: "evening",
    name: "Evening",
    note: "Gowns in Silk",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
    featured: true,
  },
  {
    slug: "archive",
    name: "Archive",
    note: "Past Shapes",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80",
    featured: false,
  },
]

export const metadata = buildMetadata({
  title: "Collections",
  description:
    "Shop KHZR collections: tailoring, essentials, evening pieces and selected archive shapes.",
  path: "/collections",
  image: COLLECTIONS[0].imageUrl,
})

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ sort?: string; filter?: string }> }) {
  const query = await searchParams
  return (
    <>
      <CollectionTracker slug="collections" name="All Collections" sort={query.sort} filter={query.filter} />
      <PageIntro
        kicker="Shop"
        title="The Collections"
        description="Move by mood, fabric, or occasion. Each section is built around silhouette, proportion, and wear."
      />
      <ul className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 lg:px-10">
        {COLLECTIONS.map((c, i) => (
          <CollectionCard key={c.slug} collection={c} index={i} />
        ))}
      </ul>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            jsonLdItemList(
              COLLECTIONS.map((c) => ({
                name: c.name,
                url: `${SITE.url}/collection/${c.slug}`,
              }))
            )
          ),
        }}
      />
    </>
  )
}
