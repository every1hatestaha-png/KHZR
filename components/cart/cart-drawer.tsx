"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
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
import { SITE } from "@/lib/constants"
import { formatMoney } from "@/lib/utils"
import { cn } from "@/lib/utils"

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

  const remaining = Math.max(0, SITE.freeShippingThreshold - subtotal)
  const progress = Math.min(
    100,
    (subtotal / SITE.freeShippingThreshold) * 100
  )
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
          className="w-full max-w-md gap-0 border-l-hairline bg-background p-0"
        >
        <SheetHeader className="flex-row items-center justify-between border-b border-hairline px-7 py-6">
          <SheetTitle className="font-display text-2xl font-light text-noir">
            Your Selection
            {count > 0 ? (
              <span className="ml-2 align-super text-xs font-medium tracking-[0.2em] text-taupe">
                {count}
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-20 text-center">
            <ShoppingBag className="size-8 stroke-[1.25] text-taupe/60" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="font-display text-xl font-light text-noir">
                Your selection is empty
              </p>
              <p className="text-sm leading-relaxed text-taupe">
                Begin with a single, considered piece.
              </p>
            </div>
            <Button asChild variant="luxury-link">
              <Link href="/collections" onClick={closeCart}>
                Explore the Collections
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-hairline px-7 py-4">
              <div className="flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.22em] text-taupe">
                <span>
                  {subtotal >= SITE.freeShippingThreshold
                    ? "Complimentary shipping unlocked"
                    : `Add ${formatMoney(remaining)} for free shipping`}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-3 h-px w-full bg-sand" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Free shipping progress">
                <div
                  className={cn(
                    "h-px bg-champagne transition-all duration-700 ease-lux",
                    hydrated ? "opacity-100" : "opacity-40"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-hairline overflow-y-auto px-7">
              {lines.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </ul>

            <div className="border-t border-hairline px-7 py-6">
              <form onSubmit={handleApply} className="flex items-stretch gap-2">
                <label htmlFor="drawer-discount-code" className="sr-only">
                  Discount code
                </label>
                <input
                  id="drawer-discount-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Promo code"
                  className="h-10 min-w-0 flex-1 border border-hairline bg-background px-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none"
                  aria-label="Discount code"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
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

              <div className="mt-5 flex flex-col gap-2.5">
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
                    {subtotal >= SITE.freeShippingThreshold
                      ? "Complimentary"
                      : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-hairline pt-3">
                  <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-noir">
                    Total
                  </span>
                  <span className="font-display text-xl text-noir">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-taupe">
                Duties and taxes calculated at checkout.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                    <ArrowRight className="ml-3 size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" onClick={closeCart}>
                  <Link href="/cart" className="text-xs tracking-[0.24em]">
                    View Full Selection
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
