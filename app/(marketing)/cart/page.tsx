"use client"

import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { SITE } from "@/lib/constants"
import { formatMoney } from "@/lib/utils"

export default function CartPage() {
  const { cart } = useCart()
  const { lines, subtotal, currency } = cart

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
          <ul className="divide-y divide-hairline">
            {lines.map((line) => (
              <CartItem key={line.id} line={line} />
            ))}
          </ul>

          <aside className="h-fit border border-hairline bg-card p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-light text-noir">
              Summary
            </h2>
            <dl className="mt-6 flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Subtotal</dt>
                <dd className="font-display text-lg text-noir">
                  {formatMoney(subtotal, currency)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Shipping</dt>
                <dd className="text-stone">
                  {subtotal >= SITE.freeShippingThreshold ? "Complimentary" : "Calculated at checkout"}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-hairline pt-4">
                <dt className="text-[0.6875rem] uppercase tracking-[0.24em] text-noir">
                  Total
                </dt>
                <dd className="font-display text-xl text-noir">
                  {formatMoney(subtotal, currency)}
                </dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-8 w-full">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-3 size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="mt-3 w-full">
              <Link href="/collections">Continue Exploring</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  )
}
