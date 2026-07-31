"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { AccountButton } from "@/components/layout/account-button"
import { cn } from "@/lib/utils"

export function HeaderActions({ className }: { className?: string }) {
  const { cart, openCart } = useCart()

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="toolbar"
      aria-label="Site tools"
    >
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
      <AccountButton />
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
    </div>
  )
}
