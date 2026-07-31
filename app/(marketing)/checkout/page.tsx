"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { createCheckoutSessionAction } from "@/lib/actions/checkout-actions"
import { priceBreakdown } from "@/lib/services/pricing-service"
import { SITE } from "@/lib/constants"
import { formatMoney } from "@/lib/utils"

export default function CheckoutPage() {
  const { cart, discount, applyDiscount, clearDiscount } = useCart()
  const { lines, subtotal, currency } = cart

  const [email, setEmail] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [code, setCode] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const pricing = priceBreakdown(subtotal, discount)

  function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    if (applyDiscount(code.trim())) setCode("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const res = await createCheckoutSessionAction({
      email,
      notes,
      discountCode: discount?.code ?? "",
    })
    if (res.ok && res.url) {
      window.location.assign(res.url)
      return
    }
    setPending(false)
    setError(res.error ?? "Checkout could not be started.")
  }

  const inputClass =
    "h-12 w-full border border-hairline bg-background px-4 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none transition-colors duration-300"

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-16 lg:px-10 lg:pt-24">
      <header className="border-b border-hairline pb-8">
        <p className="text-[0.6875rem] uppercase tracking-[0.32em] text-taupe">
          <Lock className="mr-2 inline size-3.5" aria-hidden />
          Secure Checkout
        </p>
        <h1 className="mt-3 font-display text-5xl font-light tracking-tight text-noir lg:text-6xl">
          Almost there.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">
          Payment is handled by Stripe — your address and card details are
          never stored by {SITE.name}.
        </p>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-28 text-center">
          <ShoppingBag className="size-8 stroke-[1.25] text-taupe/60" />
          <p className="font-display text-2xl font-light text-noir">
            Your selection is empty
          </p>
          <Button asChild variant="luxury-link">
            <Link href="/collections">
              Explore the Collections
              <ArrowRight className="ml-3 size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-14 lg:grid-cols-[1fr_380px]"
        >
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-light text-noir">
                Contact
              </h2>
              <label htmlFor="checkout-email" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Email address
                </span>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>
              <label htmlFor="checkout-notes" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Order note <span className="normal-case tracking-normal">(optional)</span>
                </span>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gifting instructions, tailoring notes…"
                  className="w-full border border-hairline bg-background px-4 py-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none transition-colors duration-300"
                />
              </label>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-light text-noir">
                Shipping &amp; payment
              </h2>
              <p className="text-sm leading-relaxed text-stone">
                Your shipping and billing addresses are collected on Stripe&apos;s
                secure payment page, which you are redirected to after this
                step. {SITE.shippingNote}.
              </p>            </section>

            {error ? (
              <p
                role="alert"
                className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
          </div>

          <aside className="flex h-fit flex-col border border-hairline bg-card p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-light text-noir">
              Summary
            </h2>

            <ul className="mt-6 flex flex-col divide-y divide-hairline">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center gap-4 py-4 text-sm"
                >
                  <div className="relative size-14 shrink-0 bg-ivory">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center bg-noir text-[0.625rem] text-warm-white">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-noir">
                      {line.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                      {line.color} · {line.size}
                    </p>
                  </div>
                  <p className="font-display text-base text-noir">
                    {formatMoney(line.unitPrice * line.quantity, currency)}
                  </p>
                </li>
              ))}
            </ul>

            <form onSubmit={handleApply} className="mt-4 flex items-stretch gap-2">
              <label htmlFor="checkout-discount" className="sr-only">
                Discount code
              </label>
              <input
                id="checkout-discount"
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
                  {formatMoney(pricing.subtotal, currency)}
                </dd>
              </div>
              {pricing.discount > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-taupe">Discount</dt>
                  <dd className="font-display text-lg text-champagne">
                    −{formatMoney(pricing.discount, currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Shipping</dt>
                <dd className="text-stone">
                  {pricing.shipping === 0
                    ? "Complimentary"
                    : formatMoney(pricing.shipping, currency)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Duties &amp; taxes</dt>
                <dd className="text-stone">
                  {formatMoney(pricing.tax, currency)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-hairline pt-4">
                <dt className="text-[0.6875rem] uppercase tracking-[0.24em] text-noir">
                  Total
                </dt>
                <dd className="font-display text-xl text-noir">
                  {formatMoney(pricing.total, currency)}
                </dd>
              </div>
            </dl>

            <Button
              type="submit"
              size="lg"
              className="mt-8 w-full"
              disabled={pending || !email}
            >
              {pending ? "Preparing…" : "Continue to Payment"}
              {!pending ? <ArrowRight className="ml-3 size-4" /> : null}
            </Button>

            <Button
              asChild
              variant="ghost"
              className="mt-3 w-full text-xs tracking-[0.24em]"
            >
              <Link href="/cart">
                <ArrowLeft className="mr-2 size-3.5" />
                Return to Your Selection
              </Link>
            </Button>
          </aside>
        </form>
      )}
    </div>
  )
}
