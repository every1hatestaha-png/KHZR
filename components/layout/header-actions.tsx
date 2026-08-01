"use client"

import Link from "next/link"
import { Heart, Search, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { AccountButton } from "@/components/layout/account-button"
import { useWishlist } from "@/components/wishlist/wishlist-provider"
import { cn } from "@/lib/utils"

export function HeaderActions({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="toolbar"
      aria-label="Site tools"
    >
      <SearchLink />
      <WishlistActions />
      <AccountButton />
      <CartActions />
    </div>
  )
}

function SearchLink() {
  return (
    <Link
      href="/search"
      aria-label="Search"
      className="group inline-flex size-9 items-center justify-center rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
    >
      <Search
        aria-hidden
        className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone"
      />
    </Link>
  )
}

function WishlistActions() {
  const { count } = useWishlist()

  return (
    <Link
      href="/wishlist"
      aria-label={`Saved pieces, ${count} item${count === 1 ? "" : "s"}`}
      className="group relative inline-flex size-9 items-center justify-center rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
    >
      <Heart
        aria-hidden
        className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone"
      />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-noir px-1 text-[0.5625rem] font-medium leading-none text-warm-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  )
}

function CartActions() {
  const { cart, openCart } = useCart()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open bag, ${cart.count} item${cart.count === 1 ? "" : "s"}`}
      className="group relative inline-flex size-9 items-center justify-center rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
    >
      <ShoppingBag
        aria-hidden
        className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone"
      />
      {cart.count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-noir px-1 text-[0.5625rem] font-medium leading-none text-warm-white"
        >
          {cart.count > 9 ? "9+" : cart.count}
        </span>
      ) : null}
    </button>
  )
}
