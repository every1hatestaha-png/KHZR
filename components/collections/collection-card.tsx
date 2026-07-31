import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ImageReveal } from "@/components/shared/image-reveal"
import { LazyImage } from "@/components/shared/lazy-image"
import { Reveal } from "@/components/shared/reveal"

export type CollectionCardData = {
  slug: string
  name: string
  note: string
  imageUrl: string
  featured?: boolean
}

export function CollectionCard({
  collection,
  index = 0,
}: {
  collection: CollectionCardData
  index?: number
}) {
  return (
    <Reveal as="li" delay={(index % 2) * 0.12} y={36}>
      <Link
        href={`/collection/${collection.slug}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
      >
        <div className="relative overflow-hidden bg-ivory">
          <div
            className={`w-full ${
              collection.featured ? "aspect-[3/2]" : "aspect-[3/4]"
            }`}
          >
            <ImageReveal from="bottom" className="h-full w-full">
              <LazyImage
                src={collection.imageUrl}
                alt={collection.name}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.04]"
              />
            </ImageReveal>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 px-0.5">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-light text-noir transition-colors group-hover:text-stone lg:text-3xl">
              {collection.name}
            </h2>
            <p className="text-xs tracking-wide text-taupe">{collection.note}</p>
          </div>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-champagne opacity-0 transition-all duration-500 ease-lux group-hover:translate-x-1 group-hover:opacity-100"
          />
        </div>
      </Link>
    </Reveal>
  )
}
