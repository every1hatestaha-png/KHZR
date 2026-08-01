import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "Shipping & Returns",
  description: "Shipping and returns information for KHZR orders.",
  path: "/shipping-returns",
})

export default function ShippingReturnsPage() {
  return (
    <>
      <PageIntro
        kicker="Client Care"
        title="Shipping & Returns"
        description="Clear order timing and return guidance. Final operational details should be confirmed before launch."
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-3 lg:px-10">
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Shipping</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            {SITE.shippingNote}. Delivery timing and available countries are confirmed at checkout.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Returns</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Returns are accepted within thirty days of delivery when items are unworn and tags remain attached.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Owner review</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Confirm return postage, exclusions, final sale rules, and exact delivery carriers before launch.
          </p>
        </div>
      </section>
    </>
  )
}
