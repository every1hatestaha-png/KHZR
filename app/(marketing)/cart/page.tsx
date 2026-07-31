"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { discountAmount } from "@/lib/discounts"
import { SITE } from "@/lib/constants"
import { formatMoney } from "@/lib/utils"

export default function CartPage() {
  const {
    cart,
    discount,
    applyDiscount,
    clearDiscount,
    clearCart,
  } = useCart()
  const { lines, subtotal, currency } = cart
  const [code, setCode] = React.useState("")

  const saved = discountAmount(discount, subtotal)
  const total = Math.max(0, subtotal - saved)
  const freeShipping = subtotal >= SITE.freeShippingThreshold

  function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    if (applyDiscount(code.trim())) setCode("")
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-16 lg:px-10 lg:pt-24">
      <header className="border-b border-hairline pb-8">
        <h1 className="font-display text-5xl font-light tracking-tight text-noir lg:text-6xl">
          Your Selection
        </h1>
        <p className="mt-3 text-sm text-taupe">{SITE.shippingNote}</p>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-28 text-center">
          <ShoppingBag className="size-8 stroke-[1.25] text-taupe/60" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl font-light text-noir">
              Your selection is empty
            </p>
            <p className="text-sm text-taupe">
              Begin with a single, considered piece.
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
        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col">
            <ul className="divide-y divide-hairline">
              {lines.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </ul>
            <div className="mt-8 flex justify-between border-t border-hairline pt-6">
              <Button
                asChild
                variant="ghost"
                className="text-xs tracking-[0.24em]"
              >
                <Link href="/collections">Continue Exploring</Link>
              </Button>
              <button
                type="button"
                onClick={() => void clearCart()}
                className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
              >
                Clear selection
              </button>
            </div>
          </div>

          <aside className="h-fit border border-hairline bg-card p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-light text-noir">
              Summary
            </h2>

            <form
              onSubmit={handleApply}
              className="mt-6 flex items-stretch gap-2"
            >
              <label htmlFor="discount-code" className="sr-only">
                Discount code
              </label>
              <input
                id="discount-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Promo code"
                className="h-11 min-w-0 flex-1 border border-hairline bg-background px-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none"
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

            <dl className="mt-6 flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Subtotal</dt>
                <dd className="font-display text-lg text-noir">
                  {formatMoney(subtotal, currency)}
                </dd>
              </div>
              {saved > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-taupe">Discount</dt>
                  <dd className="font-display text-lg text-champagne">
                    −{formatMoney(saved, currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Shipping</dt>
                <dd className="text-stone">
                  {freeShipping
                    ? "Complimentary"
                    : "Calculated at checkout"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Duties &amp; taxes</dt>
                <dd className="text-stone">Calculated at checkout</dd>
              </div>
              <div className="flex items-center justify-between border-t border-hairline pt-4">
                <dt className="text-[0.6875rem] uppercase tracking-[0.24em] text-noir">
                  Total
                </dt>
                <dd className="font-display text-xl text-noir">
                  {formatMoney(total, currency)}
                </dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-8 w-full">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-3 size-3.5" />
              </Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  )
}
