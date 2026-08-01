import { Reveal } from "@/components/shared/reveal"

export function BrandStatement() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            KHZR, Lahore
          </p>
          <h2 className="mt-6 font-display text-4xl font-light leading-[1.08] tracking-tight text-noir lg:text-6xl">
            Clothes shaped by warm stone, low sun, and the discipline of a
            clean line.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-stone lg:text-base">
            A women&apos;s wardrobe in softened neutrals, spare cuts, and fabric
            that moves easily between morning heat and evening rooms.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
