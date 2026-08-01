"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

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

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={
        reduceMotion ? { opacity: 0 } : { clipPath: INSETS[from] }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : { clipPath: "inset(0% 0% 0% 0%)" }
      }
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: reduceMotion ? 0.01 : duration, delay: reduceMotion ? 0 : delay, ease: EASE }}
    >
      <motion.div
        initial={reduceMotion ? undefined : { scale: 1.03 }}
        whileInView={reduceMotion ? undefined : { scale: 1 }}
        viewport={{ once: true, margin: "-64px" }}
        transition={{ duration: reduceMotion ? 0.01 : duration, delay: reduceMotion ? 0 : delay, ease: EASE }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
