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
    <li className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-3 py-6 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[6rem_minmax(0,1fr)] lg:gap-5">
      <Link
        href={`/product/${line.productSlug}`}
        className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden bg-ivory sm:w-[5.5rem] lg:w-24"
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

      <div className="flex min-w-0 flex-col gap-2">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-2">
          <div className="min-w-0">
            <p className="break-words font-display text-lg font-light leading-tight text-noir sm:text-xl">
              {line.name}
            </p>
            {line.subtitle ? (
              <p className="mt-1 break-words text-xs leading-relaxed text-taupe">{line.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void removeItem(line.id)}
            aria-label={`Remove ${line.name}`}
            className="flex min-h-11 min-w-11 items-start justify-center pt-1 text-taupe/70 transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="break-words text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
          {line.color}
          <span aria-hidden> · </span>
          {line.size}
        </p>

        <div className="mt-auto flex min-w-0 flex-col items-start gap-3 pt-3 min-[390px]:flex-row min-[390px]:items-end min-[390px]:justify-between">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => void updateQuantity(line.id, q)}
            label={`quantity of ${line.name}`}
            className="shrink-0"
          />
          <p className="break-words font-display text-lg font-light text-noir min-[390px]:text-right">
            {formatMoney(line.unitPrice * line.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}
