import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "The Lookbook",
  description:
    "Campaign series from the KHZR maison — monochrome studies and tailoring in motion.",
  path: "/lookbook",
})

export default function LookbookPage() {
  return (
    <>
      <PageIntro
        kicker="Campaign"
        title="The Lookbook"
        description="Series of the season — photographed on the street rather than the stand."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Monochrome Studies
        </p>
        <p className="max-w-md text-sm leading-relaxed text-taupe">
          The lookbook opens alongside the catalogue — editorial spreads with
          every piece shoppable from the campaign image.
        </p>
        <Button asChild variant="luxury-link" className="mt-2">
          <Link href="/collections">Explore the Collections</Link>
        </Button>
      </section>
    </>
  )
}
