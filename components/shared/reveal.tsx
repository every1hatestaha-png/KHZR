"use client"

import * as React from "react"
import { motion, useReducedMotion, type Transition } from "framer-motion"

const EASE: Transition["ease"] = [0.16, 1, 0.3, 1]

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
  const Comp = motion[as]

  return (
    <Comp
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "-72px" }}
      transition={{ duration: reduceMotion ? 0.01 : duration, delay: reduceMotion ? 0 : delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}
