import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "The Journal",
  description:
    "Notes from KHZR on silhouette, colour, fabric and getting dressed.",
  path: "/journal",
})

export default function JournalPage() {
  return (
    <>
      <PageIntro
        kicker="Writing"
        title="The Journal"
        description="Short notes on clothes, colour, and how a piece earns its place."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <div className="h-px w-16 bg-champagne" aria-hidden />
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          First notes soon.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          Expect practical writing: what changes a shoulder, how neutrals work,
          and why the right hem matters.
        </p>
      </section>
    </>
  )
}
