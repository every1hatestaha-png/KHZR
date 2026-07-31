"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Heart, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { LazyImage } from "@/components/shared/lazy-image"
import { Price } from "@/components/shared/price"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/components/wishlist/wishlist-provider"

export default function WishlistPage() {
  const { items, count, hydrated, isSignedIn, toggle } = useWishlist()
  const { addItem } = useCart()

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-16 lg:px-10 lg:pt-24">
      <header className="border-b border-hairline pb-8">
        <h1 className="font-display text-5xl font-light tracking-tight text-noir lg:text-6xl">
          Saved Pieces
        </h1>
        <p className="mt-3 text-sm text-taupe">
          {count === 0
            ? "The pieces you return to, held for a considered decision."
            : `${count} piece${count === 1 ? "" : "s"} held for you.`}
          {!isSignedIn
            ? " Signed out pieces live on this device — sign in to keep them everywhere."
            : null}
        </p>
      </header>

      {!hydrated ? (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse bg-ivory"
              aria-hidden
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-28 text-center">
          <Heart className="size-8 stroke-[1.25] text-taupe/60" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl font-light text-noir">
              Nothing saved yet
            </p>
            <p className="text-sm text-taupe">
              Mark a piece with the heart to find it here.
            </p>
          </div>
          <Button asChild variant="luxury-link">
            <Link href="/collections">
              Explore the Collections
              <ArrowRight className="ml-3 size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {items.map((item) => {
            const saved = true
            return (
              <li key={item.productSlug} className="group flex flex-col">
                <div className="relative overflow-hidden bg-ivory">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="block aspect-[3/4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                    aria-label={item.name}
                  >
                    {item.imageUrl ? (
                      <LazyImage
                        src={item.imageUrl}
                        alt={item.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void toggle(item)}
                    aria-label={`Remove ${item.name} from your saved pieces`}
                    aria-pressed={saved}
                    className="absolute right-3.5 top-3.5 inline-flex size-9 items-center justify-center rounded-none bg-background/85 backdrop-blur-sm transition-colors duration-300 ease-lux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                  >
                    <Heart
                      aria-hidden
                      className="size-4.5 fill-noir stroke-noir"
                    />
                  </button>
                  {item.available > 0 ? (
                    <button
                      type="button"
                      onClick={() => void addItem(item)}
                      aria-label={`Add ${item.name} to your selection`}
                      className="absolute inset-x-0 bottom-0 flex h-11 translate-y-full items-center justify-center gap-2 bg-noir/90 text-[0.625rem] font-medium uppercase tracking-[0.3em] text-warm-white backdrop-blur-sm transition-all duration-500 ease-lux focus-visible:translate-y-0 group-hover:translate-y-0 group-focus-within:translate-y-0 hover:bg-noir"
                    >
                      <ShoppingBag className="size-3.5" aria-hidden />
                      Add to Bag
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
                      href={`/product/${item.productSlug}`}
                      className="font-display text-lg font-normal leading-tight text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                    >
                      {item.name}
                    </Link>
                    <Price
                      value={item.unitPrice}
                      className="text-lg"
                    />
                  </div>
                  {item.subtitle ? (
                    <p className="text-xs text-taupe">{item.subtitle}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {hydrated && items.length > 0 ? (
        <div className="mt-16 border-t border-hairline pt-8 text-center">
          <Button asChild variant="luxury-link">
            <Link href="/collections">
              Continue Exploring
              <ArrowRight className="ml-3 size-3.5" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
