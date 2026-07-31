"use client"

import * as React from "react"

const MESSAGES = [
  "Coming Soon",
]

export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-noir py-2.5">
      <div
        className="flex items-center justify-center gap-8 px-4 text-center"
        aria-live="polite"
      >
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-warm-white/90">
          {MESSAGES[0]}
        </span>
      </div>
    </div>
  )
}
