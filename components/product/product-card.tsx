"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
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

  function quickAdd() {
    if (!inStock) return
    void addItem(summary)
  }

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden bg-ivory">
        <Link
          href={`/product/${product.slug}`}
          className="block aspect-[3/4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          aria-label={product.name}
        >
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.03]"
          />
        </Link>

        {product.badge || product.isNew ? (
          <span className="absolute left-4 top-4 bg-background/85 px-2.5 py-1 text-[0.5625rem] font-medium uppercase tracking-[0.24em] text-noir backdrop-blur-sm">
            {product.badge
              ? BADGE_LABEL[product.badge]
              : "New"}
          </span>
        ) : null}

        <WishlistToggle
          item={summary}
          className="absolute right-3.5 top-3.5 size-9 bg-background/85 backdrop-blur-sm"
        />

        {inStock ? (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${product.name} to your selection`}
            className="absolute inset-x-0 bottom-0 flex h-11 translate-y-full items-center justify-center gap-2 bg-noir/90 text-[0.625rem] font-medium uppercase tracking-[0.3em] text-warm-white backdrop-blur-sm transition-all duration-500 ease-lux focus-visible:translate-y-0 group-hover:translate-y-0 group-focus-within:translate-y-0 hover:bg-noir"
          >
            <Plus className="size-3.5" aria-hidden />
            Quick Add
          </button>
        ) : (
          <span className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center bg-sand/90 text-[0.625rem] font-medium uppercase tracking-[0.3em] text-taupe backdrop-blur-sm">
            Sold Out
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-1.5 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="font-display text-lg font-normal leading-tight text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          >
            {product.name}
          </Link>
          <Price value={product.price} compareAt={product.compareAtPrice} className="text-lg" />
        </div>
        {product.subtitle ? (
          <p className="text-xs text-taupe">{product.subtitle}</p>
        ) : null}
      </div>
    </article>
  )
}
