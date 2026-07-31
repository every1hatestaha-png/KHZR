import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "The Journal",
  description:
    "Essays from the KHZR maison — on craft, colour and the grammar of quiet luxury.",
  path: "/journal",
})

export default function JournalPage() {
  return (
    <>
      <PageIntro
        kicker="Writing"
        title="The Journal"
        description="Essays from the editorial office and the atelier floor."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          The first essays are being set.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-taupe">
          Notes on the double-faced overcoat, a season in neutrals, and the
          grammar of quiet luxury.
        </p>
      </section>
    </>
  )
}
