"use client"

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
import { SITE } from "@/lib/constants"
import { formatMoney } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function CartDrawer() {
  const { cart, isOpen, closeCart, hydrated } = useCart()
  const { lines, subtotal, count, currency } = cart

  const remaining = Math.max(0, SITE.freeShippingThreshold - subtotal)
  const progress = Math.min(
    100,
    (subtotal / SITE.freeShippingThreshold) * 100
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full max-w-md gap-0 border-l-hairline bg-background p-0"
        aria-describedby={undefined}
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
            <ShoppingBag className="size-8 stroke-[1.25] text-taupe/60" />
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
              <div className="mt-3 h-px w-full bg-sand" role="presentation">
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
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] uppercase tracking-[0.28em] text-taupe">
                  Subtotal
                </span>
                <span className="font-display text-xl text-noir">
                  {formatMoney(subtotal, currency)}
                </span>
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
