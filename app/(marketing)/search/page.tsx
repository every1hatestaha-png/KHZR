import { PageIntro } from "@/components/shared/page-intro"
import { SearchTracker } from "@/components/analytics/event-trackers"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Search",
  description: "Search KHZR ready-to-wear eastern dresses.",
  path: "/search",
  noindex: true,
})

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams
  return (
    <>
      <SearchTracker term={query.q} />
      <PageIntro
        kicker="Search"
        title="Find a piece."
        description="Search by product name, color, fabric, work type, or ready-to-wear collection."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <div className="h-px w-16 bg-champagne" aria-hidden />
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Search is almost ready.
        </p>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10" aria-live="polite" aria-atomic="true">
        <p className="text-center text-sm leading-relaxed text-stone">
          Until then, use Ready to Wear to browse the launch edit.
        </p>
      </section>
    </>
  )
}
