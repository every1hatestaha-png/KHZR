import * as React from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/shared/reveal"

type SectionHeadingProps = {
  kicker?: string
  title: string
  description?: string
  align?: "left" | "center" | "right"
  as?: "h1" | "h2" | "h3"
  className?: string
  action?: React.ReactNode
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  className,
  action,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        align === "right" && "items-end text-right",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {kicker ? (
          <div
            className={cn(
              "flex items-center gap-3",
              align === "center" && "justify-center",
              align === "right" && "justify-end"
            )}
          >
            <span className="h-px w-8 bg-champagne" aria-hidden />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
              {kicker}
            </span>
          </div>
        ) : null}
        <Heading className="font-display text-4xl font-light leading-[1.08] tracking-tight text-noir sm:text-5xl lg:text-6xl">
          {title}
        </Heading>
      </div>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-stone">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Reveal>
  )
}
