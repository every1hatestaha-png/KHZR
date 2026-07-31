import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Studio",
  description: "The KHZR studio.",
  path: "/admin",
  noindex: true,
})

export default function AdminPage() {
  return (
    <>
      <PageIntro
        kicker="The Studio"
        title="Administration."
        description="Catalogue, orders, campaigns and content management — Phase 7."
      />
      <section className="mx-auto flex max-w-[1400px] items-center justify-center border-t border-hairline px-5 py-20 lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Quietly in the back of house.
        </p>
      </section>
    </>
  )
}
