import * as React from "react"
import { cn } from "@/lib/utils"

type MarqueeProps = {
  children: React.ReactNode
  className?: string
  slow?: boolean
  ariaLabel?: string
}

export function Marquee({
  children,
  className,
  slow = false,
  ariaLabel,
}: MarqueeProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      role="presentation"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-16 pr-16 hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]",
          slow ? "animate-marquee-slow" : "animate-marquee"
        )}
      >
        <div className="flex shrink-0 items-center gap-16">{children}</div>
        <div
          aria-hidden
          className="flex shrink-0 items-center gap-16"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
