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
    <li className="flex gap-5 py-7 lg:gap-6">
      <Link
        href={`/product/${line.productSlug}`}
        className="relative block h-36 w-28 shrink-0 overflow-hidden bg-ivory lg:h-40 lg:w-[7.5rem]"
        onClick={() => undefined}
        aria-hidden
        tabIndex={-1}
      >
        {line.imageUrl ? (
          <LazyImage
            src={line.imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 112px, 120px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-light leading-tight text-noir">
              {line.name}
            </p>
            {line.subtitle ? (
              <p className="mt-1 text-xs leading-relaxed text-taupe">{line.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void removeItem(line.id)}
            aria-label={`Remove ${line.name}`}
            className="min-h-11 min-w-11 text-taupe/70 transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
          {line.color}
          <span aria-hidden> · </span>
          {line.size}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => void updateQuantity(line.id, q)}
            label={`quantity of ${line.name}`}
          />
          <p className="font-display text-lg font-light text-noir">
            {formatMoney(line.unitPrice * line.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}
