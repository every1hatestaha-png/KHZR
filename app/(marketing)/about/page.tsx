import { PageIntro } from "@/components/shared/page-intro"
import { Marquee } from "@/components/shared/marquee"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "The Maison",
  description:
    "KHZR is an international fashion house. Garments, collections and campaigns composed with restraint.",
  path: "/about",
})

const PRINCIPLES = [
  {
    title: "The Atelier",
    body: "Garments are cut and pressed in a single atelier, from a pattern archive that is never digitised.",
  },
  {
    title: "The Materials",
    body: "Wool from a single mill, silk from a single farm, leather from a single tannery — chosen once, never changed.",
  },
  {
    title: "The Promise",
    body: "Every piece is made to be kept. Repairs, recutting and re-buttoning are offered for the life of the garment.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="The Maison"
        title="Quiet, by design."
        description={`${SITE.legalName} was founded on a single conviction: that clothes are the least important thing we make. What matters is the discipline around them.`}
      />

      <section className="border-y border-hairline bg-ivory/50">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 lg:grid-cols-3 lg:gap-0 lg:px-10 lg:py-24">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="flex flex-col gap-4 border-hairline py-6 lg:border-l lg:px-10 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="font-display text-sm tracking-[0.3em] text-champagne">
                0{i + 1}
              </span>
              <h2 className="font-display text-2xl font-light text-noir">
                {p.title}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-stone">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="overflow-hidden py-10" aria-hidden>
        <Marquee slow>
          <span className="flex items-center gap-16 pr-16 font-display text-4xl font-light text-noir/25 lg:text-5xl">
            <span>Made to be kept</span>
            <span className="text-champagne/60">✦</span>
          </span>
        </Marquee>
      </div>

      <section className="mx-auto max-w-[1400px] px-5 pb-24 lg:px-10">
        <div className="grid gap-8 border-t border-hairline pt-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-light text-noir">
              Correspondence
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
              Letters from the maison are answered by people, within a day.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="w-fit text-noir underline-offset-8 transition-colors hover:text-champagne focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
            >
              {SITE.email}
            </a>
            <p className="text-taupe">
              {SITE.phone}
            </p>
            <p className="text-taupe">
              {SITE.address.line1} · {SITE.address.city}, {SITE.address.region}{" "}
              {SITE.address.postalCode}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
