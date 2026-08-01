import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Search",
  description: "Search the KHZR catalogue.",
  path: "/search",
  noindex: true,
})

export default function SearchPage() {
  return (
    <>
      <PageIntro
        kicker="Search"
        title="Find a piece."
        description="Full-text search across the catalogue — by name, material, collection or colour."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <div className="h-px w-16 bg-champagne" aria-hidden />
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          The index is being compiled.
        </p>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10" aria-live="polite" aria-atomic="true">
        <p className="text-center text-sm leading-relaxed text-stone">
          Please check back soon for full-text search functionality.
        </p>
      </section>
    </>
  )
}
