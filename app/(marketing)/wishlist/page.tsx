"use client"

import * as React from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
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
      <header className="border-b border-hairline pb-10">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
          Wishlist
        </p>
        <h1 className="font-display text-5xl font-light tracking-tight text-noir lg:text-6xl">
          Saved Pieces
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          {count === 0
            ? "Save pieces while you compare size, colour, and styling."
            : `${count} saved piece${count === 1 ? "" : "s"}.`}
          {!isSignedIn
            ? " Sign in to keep them across devices."
            : null}
        </p>
      </header>

      {!hydrated ? (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse bg-ivory motion-reduce:animate-none"
              aria-hidden
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-7 py-28 text-center">
          <div className="h-px w-16 bg-champagne" aria-hidden />
          <div className="flex flex-col gap-2">
            <p className="font-display text-3xl font-light text-noir lg:text-4xl">
              No saved pieces yet
            </p>
            <p className="text-sm leading-relaxed text-stone">
              Use the heart on any product to add it here.
            </p>
          </div>
          <Button asChild variant="luxury-link">
            <Link href="/collections">
              Explore the Collections
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {items.map((item) => {
            const saved = true
            return (
              <li key={item.productSlug} className="group flex flex-col">
                <div className="relative overflow-hidden bg-ivory/80">
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
                        className="h-full w-full object-cover transition-transform duration-[700ms] ease-lux group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void toggle(item)}
                    aria-label={`Remove ${item.name} from your saved pieces`}
                    aria-pressed={saved}
                    className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-none bg-warm-white/78 backdrop-blur-sm transition-colors duration-300 ease-lux hover:bg-warm-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:right-3 sm:top-3"
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
                      className="absolute inset-x-2 bottom-2 flex h-11 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-[0.5625rem] font-medium uppercase tracking-[0.22em] text-noir opacity-100 backdrop-blur-sm transition-[background-color,border-color,opacity,transform] duration-[240ms] ease-lux hover:bg-warm-white active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:inset-x-3 sm:bottom-3 sm:translate-y-2 sm:tracking-[0.28em] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:active:translate-y-0"
                    >
                      Add to Bag
                    </button>
                  ) : (
                    <span className="absolute inset-x-2 bottom-2 flex h-11 items-center justify-center border border-warm-white/55 bg-warm-white/88 text-[0.5625rem] font-medium uppercase tracking-[0.22em] text-stone backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:tracking-[0.28em]">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 px-0.5 lg:mt-5">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="break-words font-display text-[1.0625rem] font-light leading-tight text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne lg:text-xl"
                    >
                      {item.name}
                    </Link>
                    <Price
                      value={item.unitPrice}
                      className="text-sm sm:text-right lg:text-base"
                    />
                  </div>
                  {item.subtitle ? (
                    <p className="max-w-[18rem] text-xs leading-relaxed text-taupe">{item.subtitle}</p>
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
              Continue Shopping
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
