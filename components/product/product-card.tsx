"use client"

import * as React from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { LazyImage } from "@/components/shared/lazy-image"
import { Price } from "@/components/shared/price"
import { WishlistToggle } from "@/components/wishlist/wishlist-toggle"
import { cardToSummary } from "@/lib/product-summary"
import type { ProductCardDTO } from "@/lib/data-access/site"

const BADGE_LABEL: Record<string, string> = {
  NEW: "New",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Sold Out",
}

export function ProductCard({ product }: { product: ProductCardDTO }) {
  const { addItem } = useCart()
  const inStock = product.defaultVariant.stock > 0
  const summary = React.useMemo(() => cardToSummary(product), [product])
  const launchLabel = ["Printed Pret", "Embroidered Pret"].includes(product.collectionName)
    ? product.collectionName
    : null

  function quickAdd() {
    if (!inStock) return
    void addItem(summary)
  }

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden bg-ivory/80">
        <Link
          href={`/product/${product.slug}`}
          className="block aspect-[3/4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:aspect-[2/3]"
          aria-label={product.name}
        >
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-lux group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>

        {product.badge || product.isNew ? (
          <span className="absolute left-2 top-2 max-w-[calc(100%-3.75rem)] bg-warm-white/78 px-2 py-1 text-[0.5rem] font-medium uppercase tracking-[0.18em] text-stone backdrop-blur-sm sm:left-3 sm:top-3 sm:tracking-[0.22em]">
            {product.badge
              ? BADGE_LABEL[product.badge]
              : "New"}
          </span>
        ) : null}

        <WishlistToggle
          item={summary}
          className="absolute right-2 top-2 size-11 bg-warm-white/78 text-noir backdrop-blur-sm hover:bg-warm-white sm:right-3 sm:top-3"
        />

        {inStock ? (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${product.name} to your selection`}
            className="absolute inset-x-2 bottom-2 flex h-11 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-[0.5625rem] font-medium uppercase tracking-[0.22em] text-noir opacity-100 backdrop-blur-sm transition-[background-color,border-color,opacity,transform] duration-[240ms] ease-lux hover:bg-warm-white active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:inset-x-3 sm:bottom-3 sm:translate-y-2 sm:tracking-[0.28em] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:active:translate-y-0"
          >
            Quick Add
          </button>
        ) : (
          <span className="absolute inset-x-2 bottom-2 flex h-11 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-[0.5625rem] font-medium uppercase tracking-[0.22em] text-stone backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:tracking-[0.28em]" role="status" aria-live="polite">
            Sold Out
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 px-0.5 lg:mt-5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <Link
            href={`/product/${product.slug}`}
            className="break-words font-display text-[1.0625rem] font-light leading-tight text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne lg:text-xl"
          >
            {product.name}
          </Link>
          <Price value={product.price} compareAt={product.compareAtPrice} className="text-sm sm:text-right lg:text-base" />
        </div>
        {product.subtitle ? (
          <p className="max-w-[18rem] text-xs leading-relaxed text-taupe">{product.subtitle}</p>
        ) : null}
        {launchLabel ? (
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-taupe">{launchLabel}</p>
        ) : null}
      </div>
    </article>
  )
}
