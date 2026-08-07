import Link from "next/link"
import { LazyImage } from "@/components/shared/lazy-image"
import { Reveal } from "@/components/shared/reveal"

const CATEGORIES = [
  {
    label: "New Arrivals",
    href: "/collection/new-arrivals",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    label: "Ready to Wear",
    href: "/collection/ready-to-wear",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=80",
  },
]

export function CategoryGrid({ images = [] }: { images?: string[] }) {
  return (
    <section className="border-y border-hairline bg-ivory/45">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-3 lg:max-w-xl">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            Shop Ready to Wear
          </p>
          <h2 className="font-display text-4xl font-light leading-[1.06] tracking-tight text-noir lg:text-5xl">
            Choose the launch edit.
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {CATEGORIES.map((category, i) => (
            <Reveal as="li" key={category.label} delay={i * 0.08} y={24}>
              <Link
                href={category.href}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-sand">
                  <LazyImage
                    src={images[i] ?? category.imageUrl}
                    alt=""
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className="object-contain"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-noir/45 via-noir/5 to-transparent"
                  />
                  <span className="absolute bottom-5 left-5 font-display text-3xl font-light text-warm-white">
                    {category.label}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
