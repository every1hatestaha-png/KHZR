import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "The Lookbook",
  description:
    "KHZR lookbook: campaign studies in tailoring, evening pieces and warm neutrals.",
  path: "/lookbook",
})

export default function LookbookPage() {
  return (
    <>
      <PageIntro
        kicker="Campaign"
        title="The Lookbook"
        description="Seasonal images for shape, styling, and proportion."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <div className="h-px w-16 bg-champagne" aria-hidden />
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Studies in Shape
        </p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          The lookbook will open with campaign images and direct paths to the
          pieces shown.
        </p>
        <Button asChild variant="luxury-link" className="mt-2">
          <Link href="/collections">Explore the Collections</Link>
        </Button>
      </section>
    </>
  )
}
