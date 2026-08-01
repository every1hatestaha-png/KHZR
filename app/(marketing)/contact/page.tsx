import { PageIntro } from "@/components/shared/page-intro"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Write to the maison. Letters are answered by people, within a day.",
  path: "/contact",
})

const TOPICS = [
  { label: "Client Care", value: "care@khzr.example.com" },
  { label: "Press", value: "press@khzr.example.com" },
  { label: "The Atelier", value: "atelier@khzr.example.com" },
]

export default function ContactPage() {
  return (
    <>
      <PageIntro
        kicker="Correspondence"
        title="Write to us."
        description="Letters are answered by people, within a day. For sizing, repairs and everything in between."
      />

      <section className="mx-auto max-w-[1400px] px-5 pb-24 lg:px-10">
        <div className="grid gap-12 border-t border-hairline pt-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-7">
            {TOPICS.map((t) => (
              <div
                key={t.value}
                className="flex flex-col gap-2 border-b border-hairline py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-taupe">
                  {t.label}
                </span>
                <a
                  href={`mailto:${t.value}`}
                  className="font-display text-xl font-light text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
                >
                  {t.value}
                </a>
              </div>
            ))}
            <p className="max-w-md text-sm leading-relaxed text-stone">
              {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city},{" "}
              {SITE.address.region} {SITE.address.postalCode},{" "}
              {SITE.address.country}
            </p>
          </div>

          <div className="flex flex-col gap-6 border-t border-hairline pt-12 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-3xl font-light text-noir lg:text-4xl">
                The Newsletter
              </h2>
              <p className="text-sm leading-relaxed text-stone">
                One letter a month — collections, atelier notes and the
                occasional reissue.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}
