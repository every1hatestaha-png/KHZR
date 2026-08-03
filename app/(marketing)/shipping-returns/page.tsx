import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Shipping & Returns",
  description: "Shipping and 7-day returns information for KHZR ready-to-wear orders in Pakistan.",
  path: "/shipping-returns",
})

export default function ShippingReturnsPage() {
  return (
    <>
      <PageIntro
        kicker="Client Care"
        title="Shipping & Returns"
        description="Delivery and return guidance for KHZR ready-to-wear eastern dresses in Pakistan."
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-3 lg:px-10">
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Shipping</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Lahore delivery target is 2 to 3 business days. Pakistan delivery options use the current shipping system and are confirmed at checkout.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Returns</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Returns are accepted within 7 days after delivery. Returned items must be unused, unwashed, in original condition, with tags attached.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Packaging</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Orders ship in simple packaging with a red KHZR tag.
          </p>
        </div>
      </section>
    </>
  )
}
