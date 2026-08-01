import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy information for KHZR customers.",
  path: "/privacy",
  noindex: true,
})

const SECTIONS = [
  {
    title: "What we collect",
    body: "We collect the information needed to run the store: contact details, order details, delivery information, account details when you sign in, and messages you send to client care.",
  },
  {
    title: "Payments",
    body: "Payments are processed by Stripe. KHZR does not store full card numbers or card security codes.",
  },
  {
    title: "Service providers",
    body: "We use trusted providers for hosting, authentication, payments, email, analytics, media hosting, and order operations. They receive only the information needed to provide those services.",
  },
  {
    title: "Owner review required",
    body: "Confirm jurisdiction-specific privacy rights, data retention periods, cookie disclosures, and any regional compliance requirements before launch.",
  },
]

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        kicker="Legal"
        title="Privacy Policy"
        description={`How ${SITE.name} handles customer information. This page should be reviewed by the store owner before launch.`}
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
