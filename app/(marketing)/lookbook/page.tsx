import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Lookbook",
  description: "KHZR launch shopping now focuses on ready-to-wear eastern dresses.",
  path: "/lookbook",
  noindex: true,
})

export default function LookbookPage() {
  return (
    <>
      <PageIntro
        kicker="Campaign"
        title="Lookbook is paused for launch."
        description="KHZR launch discovery is focused on ready-to-wear eastern dresses."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline bg-ivory/35 px-5 py-20 text-center lg:px-10 lg:py-28">
        <div className="h-px w-16 bg-champagne" aria-hidden />
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Shop the launch edit.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          Browse New Arrivals, Ready to Wear, Printed Pret, and Embroidered Pret.
        </p>
        <Button asChild variant="luxury-link" className="mt-2">
          <Link href="/collections">Shop Ready to Wear</Link>
        </Button>
      </section>
    </>
  )
}
