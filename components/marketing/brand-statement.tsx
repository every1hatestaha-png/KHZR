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
            Cut for heat, movement, and rooms that change after sunset.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-stone lg:text-base">
            KHZR begins with the atmosphere of Lahore: pale walls, low sun,
            sharp shade. The clothes keep that clarity close to the body.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
