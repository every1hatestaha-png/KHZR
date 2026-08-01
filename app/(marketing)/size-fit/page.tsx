import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Size & Fit",
  description: "Size and fit guidance for KHZR womenswear.",
  path: "/size-fit",
})

export default function SizeFitPage() {
  return (
    <>
      <PageIntro
        kicker="Client Care"
        title="Size & Fit"
        description="Use the product fit notes first. Contact client care when you are between sizes."
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-3 lg:px-10">
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Choosing size</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Product pages list available sizes, colour, and fit notes. Select the size you usually wear unless a product note suggests otherwise.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Fit questions</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Email client care with your measurements and the product name for guidance before ordering.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Owner review</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Add final garment measurement charts and any brand-specific size conversions before launch.
          </p>
        </div>
      </section>
    </>
  )
}
