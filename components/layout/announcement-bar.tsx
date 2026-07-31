"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { SITE } from "@/lib/constants"

const MESSAGES = [
  SITE.shippingNote,
  "Numbered pieces · Made to be kept",
  "Complimentary returns within thirty days",
]

export function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % MESSAGES.length)
  }, [])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  return (
    <div className="relative overflow-hidden bg-noir py-2.5">
      <div
        className="flex items-center justify-center gap-8 px-4 text-center transition-opacity duration-500 motion-reduce:transition-none"
        aria-live="polite"
      >
        <span
          key={index}
          className="animate-fade-up text-[0.625rem] font-medium uppercase tracking-[0.3em] text-warm-white/90"
        >
          {MESSAGES[index]}
        </span>
      </div>
    </div>
  )
}
