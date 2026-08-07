import { PageIntro } from "@/components/shared/page-intro"
import { CollectionCard } from "@/components/collections/collection-card"
import { CollectionTracker } from "@/components/analytics/event-trackers"
import { buildMetadata, jsonLdItemList, jsonLdScript } from "@/lib/seo"
import { SITE } from "@/lib/constants"
import { visibleLaunchCollections } from "@/lib/launch-collections"

const COLLECTIONS = visibleLaunchCollections()

export const metadata = buildMetadata({
  title: "Ready to Wear",
  description: "Shop KHZR ready-to-wear eastern dresses in Pakistan.",
  path: "/collections",
  image: COLLECTIONS[0].imageUrl,
})

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ sort?: string; filter?: string }> }) {
  const query = await searchParams
  return (
    <>
      <CollectionTracker slug="collections" name="Ready to Wear" sort={query.sort} filter={query.filter} />
      <PageIntro
        kicker="Shop"
        title="Ready to Wear"
        description="Browse launch edits for Pakistani women: New Arrivals and Ready to Wear in PKR."
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
