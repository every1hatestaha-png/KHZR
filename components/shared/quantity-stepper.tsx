"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  label?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
  label = "Quantity",
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={cn(
        "inline-flex items-stretch border border-hairline",
        className
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="flex size-9 items-center justify-center text-noir/70 transition-colors hover:bg-ivory hover:text-noir disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-champagne"
      >
        <Minus className="size-3.5" />
      </button>
      <output
        aria-live="polite"
        className="flex w-10 items-center justify-center border-x border-hairline text-xs font-medium tracking-widest text-noir"
      >
        {value}
      </output>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="flex size-9 items-center justify-center text-noir/70 transition-colors hover:bg-ivory hover:text-noir disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-champagne"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
