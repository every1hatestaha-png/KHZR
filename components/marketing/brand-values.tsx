import { Reveal } from "@/components/shared/reveal"

const VALUES = [
  {
    no: "01",
    title: "Considered Cuts",
    body: "Every silhouette is drafted from a couture pattern archive and cut by hand — never graded by default.",
  },
  {
    no: "02",
    title: "Materials, Chosen Once",
    body: "Wool from a single mill, silk from a single farm, leather from a single tannery. When we find the right one, we never change it.",
  },
  {
    no: "03",
    title: "Made to Be Kept",
    body: "Double-faced seams, floated canvases and horn buttons. Garments built for decades, not seasons.",
  },
]

export function BrandValues() {
  return (
    <section className="border-t border-hairline bg-ivory/50">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 lg:grid-cols-3 lg:gap-0 lg:px-10 lg:py-24">
        {VALUES.map((v, i) => (
          <Reveal
            key={v.no}
            delay={i * 0.12}
            className="flex flex-col gap-4 border-hairline px-0 py-8 lg:border-l lg:px-10 lg:first:border-l-0 lg:first:pl-0"
          >
            <span className="font-display text-sm tracking-[0.3em] text-champagne">
              {v.no}
            </span>
            <h3 className="font-display text-2xl font-light text-noir">
              {v.title}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-stone">
              {v.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
