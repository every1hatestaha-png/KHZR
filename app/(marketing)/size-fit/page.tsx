import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Size & Fit",
  description: "Size and fit guidance for KHZR ready-to-wear eastern dresses in S, M, and L.",
  path: "/size-fit",
})

export default function SizeFitPage() {
  return (
    <>
      <PageIntro
        kicker="Client Care"
        title="Size & Fit"
        description="Launch ready-to-wear pieces are prepared in S, M, and L. Use each product's size guide notes first."
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-3 lg:px-10">
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Choosing size</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Product pages list available sizes S, M, and L with any product-specific size guide notes. Select the size you usually wear unless a product note suggests otherwise.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Fit questions</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Email client care with your measurements and the product name for guidance before ordering.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Product notes</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Check fabric, sleeve, neckline, and included pieces on each product page before ordering.
          </p>
        </div>
      </section>
    </>
  )
}
