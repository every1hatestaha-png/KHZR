"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LazyImage } from "@/components/shared/lazy-image"
import { analytics } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const
const SWIPE_THRESHOLD = 40

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
  const touchStartX = React.useRef<number | null>(null)
  const [ratio, setRatio] = React.useState<number | null>(null)
  const total = images.length

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setIndex((i) => (i - 1 + total) % total)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setIndex((i) => (i + 1) % total)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [total])

  if (images.length === 0) return null
  const current = images[Math.min(index, images.length - 1)]
  const currentAlt = `${alt} — view ${index + 1} of ${images.length}`

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setRatio(img.naturalWidth / img.naturalHeight)
    }
  }

  function trackOption(value: number) {
    if (productSlug) analytics.productOption({ option: "gallery_image", value: String(value + 1), productSlug })
  }

  function goTo(next: number) {
    const clamped = (next + total) % total
    setIndex(clamped)
    trackOption(clamped)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (dx < 0) goTo(index + 1)
    else goTo(index - 1)
  }

  function onWheel(e: React.WheelEvent) {
    const dx = Math.abs(e.deltaX)
    const dy = Math.abs(e.deltaY)
    if (dx < 24 || dx < dy) return
    if (e.deltaX > 0) goTo(index + 1)
    else goTo(index - 1)
  }

  return (
    <div className="flex flex-col gap-5" role="region" aria-label="Product gallery">
      <div
        className="group relative w-full touch-pan-y overflow-hidden bg-ivory lg:h-[72vh] lg:min-h-[560px] lg:max-h-[760px]"
        style={{ aspectRatio: ratio ? `${ratio}` : "4 / 5" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: EASE }}
          >
            <LazyImage
              src={current}
              alt={currentAlt}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-contain"
              onLoad={onImageLoad}
            />
          </motion.div>
        </AnimatePresence>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-noir backdrop-blur-sm transition-[background-color,opacity] duration-[220ms] ease-lux hover:bg-warm-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 motion-reduce:transition-none"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-noir backdrop-blur-sm transition-[background-color,opacity] duration-[220ms] ease-lux hover:bg-warm-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 motion-reduce:transition-none"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="grid grid-flow-col auto-cols-[5.25rem] gap-3 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch] lg:auto-cols-[5.5rem]" role="group" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1} of ${total}`}
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
