import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms of service for KHZR orders and storefront use.",
  path: "/terms",
  noindex: true,
})

const SECTIONS = [
  {
    title: "Orders",
    body: "Submitting an order starts the checkout process. An order is confirmed when payment is completed and KHZR sends confirmation.",
  },
  {
    title: "Product information",
    body: "We aim to show products, colours, prices, and availability accurately. Minor colour variation can occur across screens.",
  },
  {
    title: "Pricing and payment",
    body: "Prices are shown in PKR. Shipping, duties, taxes, and payment options are confirmed during checkout.",
  },
  {
    title: "Owner review required",
    body: "Confirm governing law, dispute terms, final sale rules, cancellation rights, and any region-specific consumer terms before launch.",
  },
]

export default function TermsPage() {
  return (
    <>
      <PageIntro
        kicker="Legal"
        title="Terms of Service"
        description={`Terms for using ${SITE.name} and placing orders. Review before launch.`}
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-2 lg:px-10">
        {SECTIONS.map((section) => (
          <div key={section.title} className="border-b border-hairline pb-8">
            <h2 className="font-display text-3xl font-light text-noir">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone">
              {section.body}
            </p>
          </div>
        ))}
      </section>
    </>
  )
}
