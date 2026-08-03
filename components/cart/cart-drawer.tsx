"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { CartItem } from "@/components/cart/cart-item"
import { discountAmount } from "@/lib/discounts"
import { formatMoney } from "@/lib/utils"

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    hydrated,
    discount,
    applyDiscount,
    clearDiscount,
  } = useCart()
  const { lines, subtotal, count, currency } = cart
  const [code, setCode] = React.useState("")

  const saved = discountAmount(discount, subtotal)
  const total = Math.max(0, subtotal - saved)

  function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    if (applyDiscount(code.trim())) setCode("")
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent
          side="right"
          className="w-[min(100vw,30rem)] max-w-none gap-0 overflow-x-hidden border-l border-hairline bg-background p-0 sm:w-[min(100vw,28rem)]"
        >
        <SheetHeader className="flex-row items-center justify-between border-b border-hairline px-5 py-5 pr-14 sm:px-7 sm:py-7 lg:px-9">
          <SheetTitle className="font-display text-2xl font-light text-noir sm:text-3xl">
            Your Selection
            {count > 0 ? (
              <span className="ml-2 align-super text-xs font-medium tracking-[0.2em] text-taupe">
                {count}
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-24 text-center">
            <div className="h-px w-14 bg-champagne" aria-hidden />
            <div className="flex flex-col gap-2">
              <p className="font-display text-2xl font-light text-noir">
                Your bag is empty
              </p>
              <p className="text-sm leading-relaxed text-taupe">
                Start with New Arrivals or browse Ready to Wear.
              </p>
            </div>
            <Button asChild variant="luxury-link">
              <Link href="/collections" onClick={closeCart}>
                Shop Ready to Wear
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-hairline bg-ivory/35 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-[0.6875rem] uppercase tracking-[0.22em] text-taupe">
                <span>Shipping calculated at checkout.</span>
                <span>{hydrated ? `${count} item${count === 1 ? "" : "s"}` : ""}</span>
              </div>
            </div>

            <ul className="flex-1 divide-y divide-hairline overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-7">
              {lines.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </ul>

            <div className="border-t border-hairline bg-warm-white px-4 py-5 sm:px-6 sm:py-7 lg:px-7">
              <form onSubmit={handleApply} className="flex items-stretch gap-2" aria-label="Apply discount code">
                <label htmlFor="drawer-discount-code" className="sr-only">
                  Discount code
                </label>
                <input
                  id="drawer-discount-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Discount code"
                  className="h-11 min-w-0 flex-1 border border-hairline bg-background px-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none"
                  aria-label="Discount code"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-11"
                  disabled={!code.trim()}
                >
                  Apply
                </Button>
              </form>

              {discount ? (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.2em] text-taupe">
                    {discount.label}
                  </span>
                  <button
                    type="button"
                    onClick={clearDiscount}
                    className="uppercase tracking-[0.2em] text-taupe underline-offset-4 hover:text-noir hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="mt-7 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-taupe">
                    Subtotal
                  </span>
                  <span className="font-display text-lg text-noir">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                {saved > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-taupe">
                      Discount
                    </span>
                    <span className="font-display text-base text-champagne">
                      −{formatMoney(saved, currency)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-taupe">
                    Shipping
                  </span>
                  <span className="text-xs text-taupe">
                    Shipping calculated at checkout.
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-hairline pt-4">
                  <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-noir">
                    Total
                  </span>
                  <span className="font-display text-xl text-noir">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-taupe">
                Duties and taxes are shown before payment.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <Button asChild size="lg" className="min-h-12 w-full">
                  <Link href="/checkout" onClick={closeCart}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="luxury-link" onClick={closeCart}>
                  <Link href="/collections" className="text-xs tracking-[0.24em]">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
