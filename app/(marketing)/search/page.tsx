import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Search",
  description: "Search the KHZR catalogue.",
  path: "/search",
})

export default function SearchPage() {
  return (
    <>
      <PageIntro
        kicker="Search"
        title="Find a piece."
        description="Full-text search across the catalogue — by name, material, collection or colour."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          The index is being compiled.
        </p>
      </section>
    </>
  )
}
