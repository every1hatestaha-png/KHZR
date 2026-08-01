import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Care",
  description: "Care guidance for KHZR garments.",
  path: "/fabric-care",
})

export default function FabricCarePage() {
  return (
    <>
      <PageIntro
        kicker="Client Care"
        title="Care"
        description="Follow each product care label. The notes below are general guidance only."
      />
      <section className="mx-auto grid max-w-[1400px] gap-8 border-t border-hairline px-5 py-16 lg:grid-cols-3 lg:px-10">
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Read the label</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Product pages include care notes where available. Always follow the care label attached to the garment.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Between wears</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Hang structured pieces properly, air garments before storage, and avoid prolonged direct sun.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-noir">Owner review</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Confirm final care rules for each fabric category before launch.
          </p>
        </div>
      </section>
    </>
  )
}
