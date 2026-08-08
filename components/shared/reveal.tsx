"use client"

import * as React from "react"
import { useInView } from "@/hooks/use-in-view"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const EASE = [0.16, 1, 0.3, 1] as const
const EASE_CSS = `cubic-bezier(${EASE.join(",")})`

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  once?: boolean
  as?: "div" | "span" | "li" | "section" | "figure" | "header"
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  duration = 0.8,
  once = true,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const { ref, inView } = useInView<HTMLElement>({ once, margin: "-72px" })
  const Comp = as as React.ElementType

  const show = inView || reduceMotion

  const style: React.CSSProperties = {
    opacity: show ? 1 : 0,
    transform: show ? "none" : `translate3d(0, ${y}px, 0)`,
    transition: reduceMotion
      ? "none"
      : `opacity ${duration}s ${EASE_CSS} ${delay}s, transform ${duration}s ${EASE_CSS} ${delay}s`,
    willChange: show ? "auto" : "opacity, transform",
  }

  return (
    <Comp ref={ref} className={className} style={style}>
      {children}
    </Comp>
  )
}
