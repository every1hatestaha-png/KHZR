"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { QuantityStepper } from "@/components/shared/quantity-stepper"
import { LazyImage } from "@/components/shared/lazy-image"
import { formatMoney } from "@/lib/utils"
import type { CartLine } from "@/types"

export function CartItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <li className="flex gap-5 py-6">
      <Link
        href={`/product/${line.productSlug}`}
        className="relative block h-32 w-24 shrink-0 overflow-hidden bg-ivory"
        onClick={() => undefined}
        aria-hidden
        tabIndex={-1}
      >
        {line.imageUrl ? (
          <LazyImage
            src={line.imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight text-noir">
              {line.name}
            </p>
            {line.subtitle ? (
              <p className="mt-0.5 text-xs text-taupe">{line.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void removeItem(line.id)}
            aria-label={`Remove ${line.name}`}
            className="text-taupe/70 transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
          {line.color}
          <span aria-hidden> · </span>
          {line.size}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => void updateQuantity(line.id, q)}
            label={`quantity of ${line.name}`}
          />
          <p className="font-display text-base text-noir">
            {formatMoney(line.unitPrice * line.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}
