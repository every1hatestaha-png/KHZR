"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { LazyImage } from "@/components/shared/lazy-image"
import { analytics } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

export function ProductGallery({
  images,
  alt,
  productSlug,
}: {
  images: string[]
  alt: string
  productSlug?: string
}) {
  const [index, setIndex] = React.useState(0)
  const reduceMotion = useReducedMotion()

  if (images.length === 0) return null
  const current = images[Math.min(index, images.length - 1)]
  const currentAlt = `${alt} — view ${index + 1} of ${images.length}`

  return (
    <div className="flex flex-col gap-5" role="region" aria-label="Product gallery">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory lg:aspect-[5/6]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.005 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: EASE }}
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
        <div className="grid grid-flow-col auto-cols-[5.25rem] gap-3 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch] lg:auto-cols-[5.5rem]" role="group" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setIndex(i)
                if (productSlug) analytics.productOption({ option: "gallery_image", value: String(i + 1), productSlug })
              }}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === index}
              className={cn(
                "relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-ivory transition-[opacity,outline-color] duration-[220ms] ease-lux motion-reduce:transition-none",
                i === index
                  ? "outline outline-1 outline-offset-2 outline-champagne"
                  : "opacity-55 hover:opacity-100 focus-visible:opacity-100"
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
