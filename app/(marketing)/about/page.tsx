import { PageIntro } from "@/components/shared/page-intro"
import { Marquee } from "@/components/shared/marquee"
import { buildMetadata } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "About KHZR",
  description:
    "About KHZR: womenswear shaped by precise cuts, warm neutrals and a Lahore-rooted sense of light.",
  path: "/about",
})

const PRINCIPLES = [
  {
    title: "The Line",
    body: "We start with proportion: shoulder, waist, hem, and how the piece moves when worn.",
  },
  {
    title: "The Palette",
    body: "Warm white, sand, stone, noir. Colours chosen to sit together without effort.",
  },
  {
    title: "The Pace",
    body: "Fewer drops, sharper edits, and pieces that move easily from morning to evening.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="About KHZR"
        title="Clothes with a clear read."
        description={`${SITE.legalName} works in warm neutrals, precise cuts, and clothes that hold their shape without taking over the room.`}
      />

      <section className="border-y border-hairline bg-ivory/50">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 lg:grid-cols-3 lg:gap-0 lg:px-10 lg:py-28">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="flex flex-col gap-4 border-hairline py-6 lg:border-l lg:px-10 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="font-display text-sm tracking-[0.3em] text-champagne">
                0{i + 1}
              </span>
              <h2 className="font-display text-3xl font-light text-noir">
                {p.title}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-stone">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="overflow-hidden py-12" aria-hidden>
        <Marquee slow>
          <span className="flex items-center gap-16 pr-16 font-display text-4xl font-light text-noir/25 lg:text-5xl">
            <span>Warm light. Clean lines.</span>
            <span className="h-px w-16 bg-champagne/60" />
          </span>
        </Marquee>
      </div>

      <section className="mx-auto max-w-[1400px] px-5 pb-24 lg:px-10">
        <div className="grid gap-8 border-t border-hairline pt-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-light text-noir lg:text-4xl">
              Correspondence
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
              Write to us for sizing, orders, or care. We reply within one working day.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <a
              href={`mailto:${SITE.email}`}
              className="w-fit text-noir underline-offset-8 transition-colors hover:text-champagne focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
            >
              {SITE.email}
            </a>
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
