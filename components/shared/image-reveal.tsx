"use client"

import * as React from "react"
import { useInView } from "@/hooks/use-in-view"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const
const EASE_CSS = `cubic-bezier(${EASE.join(",")})`

type ImageRevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  from?: "top" | "bottom" | "left" | "right"
}

const INSETS: Record<NonNullable<ImageRevealProps["from"]>, string> = {
  top: "inset(100% 0% 0% 0%)",
  bottom: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
}

export function ImageReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  from = "bottom",
}: ImageRevealProps) {
  const reduceMotion = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, margin: "-64px" })

  const show = inView || reduceMotion

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      style={
        reduceMotion
          ? { opacity: show ? 1 : 0, transition: `opacity 0.01s linear` }
          : {
              clipPath: show ? "inset(0% 0% 0% 0%)" : INSETS[from],
              transition: `clip-path ${duration}s ${EASE_CSS} ${delay}s`,
              willChange: show ? "auto" : "clip-path",
            }
      }
    >
      <div
        className="h-full w-full"
        style={{
          transform: reduceMotion || show ? "none" : "scale(1.03)",
          transition: reduceMotion
            ? "none"
            : `transform ${duration}s ${EASE_CSS} ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
