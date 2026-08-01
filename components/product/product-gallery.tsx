"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LazyImage } from "@/components/shared/lazy-image"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

export function ProductGallery({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  const [index, setIndex] = React.useState(0)

  if (images.length === 0) return null
  const current = images[Math.min(index, images.length - 1)]
  const currentAlt = `${alt} — view ${index + 1} of ${images.length}`

  return (
    <div className="flex flex-col gap-4" role="region" aria-label="Product gallery">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <LazyImage
              src={current}
              alt={currentAlt}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1" role="group" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === index}
              className={cn(
                "relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-ivory transition-all duration-300 ease-lux",
                i === index
                  ? "outline outline-1 outline-offset-2 outline-champagne"
                  : "opacity-60 hover:opacity-100 focus-visible:opacity-100"
              )}
            >
              <LazyImage
                src={src}
                alt=""
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
