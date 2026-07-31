import * as React from "react"
import { formatMoney } from "@/lib/utils"
import { cn } from "@/lib/utils"

type PriceProps = {
  value: number | string
  currency?: string
  compareAt?: number | string | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Price({
  value,
  currency = "USD",
  compareAt,
  className,
  size = "md",
}: PriceProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-display text-noir",
        size === "sm" && "text-base",
        size === "md" && "text-lg",
        size === "lg" && "text-2xl",
        className
      )}
    >
      <span>{formatMoney(value, currency)}</span>
      {compareAt && Number(compareAt) > Number(value) ? (
        <span
          aria-label={`was ${formatMoney(compareAt, currency)}`}
          className="text-sm text-taupe line-through decoration-taupe/60"
        >
          {formatMoney(compareAt, currency)}
        </span>
      ) : null}
    </span>
  )
}
