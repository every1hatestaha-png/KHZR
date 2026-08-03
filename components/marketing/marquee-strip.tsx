import { Marquee } from "@/components/shared/marquee"

const WORDS = [
  "New Arrivals",
  "Ready to Wear",
  "Printed Pret",
  "Embroidered Pret",
  "S M L",
  "PKR 4,000 to 6,000",
]

export function MarqueeStrip() {
  return (
    <section
      className="overflow-hidden border-y border-hairline bg-background py-7"
      aria-hidden="true"
    >
      <Marquee slow>
        {WORDS.map((word) => (
          <span key={word} className="flex shrink-0 items-center gap-16">
            <span className="font-display text-2xl font-light tracking-wide text-noir/80 lg:text-3xl">
              {word}
            </span>
            <span className="text-champagne">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
