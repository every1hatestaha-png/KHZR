"use client"

import * as React from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import { cn } from "@/lib/utils"

type ParallaxProps = {
  children: React.ReactNode
  className?: string
  /** Distance the child travels, in px */
  offset?: number
  as?: "div" | "figure" | "span"
}

export function Parallax({
  children,
  className,
  offset = 60,
  as = "div",
}: ParallaxProps) {
  const reduceMotion = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])
  const Comp = motion[as]

  if (reduceMotion) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>
  }

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <Comp style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </Comp>
    </div>
  )
}
