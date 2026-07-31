"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { useWishlist } from "@/components/wishlist/wishlist-provider"
import { cn } from "@/lib/utils"
import type { ProductSummary } from "@/types"

export function WishlistToggle({
  item,
  className,
}: {
  item: ProductSummary | null
  className?: string
}) {
  const { isInWishlist, toggle } = useWishlist()
  if (!item) return null

  const saved = isInWishlist(item.productSlug)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggle(item)
      }}
      aria-label={
        saved
          ? `Remove ${item.name} from your saved pieces`
          : `Save ${item.name} to your pieces`
      }
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center justify-center rounded-none transition-colors duration-300 ease-lux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
        className
      )}
    >
      <Heart
        aria-hidden
        className={cn(
          "size-4.5 stroke-[1.4] transition-colors",
          saved
            ? "fill-noir stroke-noir"
            : "text-noir group-hover:text-stone"
        )}
      />
    </button>
  )
}
