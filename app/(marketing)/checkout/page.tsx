"use client"

import * as React from "react"
import Link from "next/link"
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
    setError(res.error ?? "We could not start checkout. Please try again.")
  }

  const inputClass =
    "h-12 w-full border border-hairline bg-background px-4 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none transition-colors duration-300"

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-14 lg:px-10 lg:pt-24">
      <header className="border-b border-hairline pb-9">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
          Secure Checkout
        </p>
        <h1 className="mt-4 font-display text-5xl font-light tracking-tight text-noir lg:text-6xl">
          Check your details.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          Enter your email here. Shipping address and payment follow securely with Stripe.
        </p>
      </header>

      {lines.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-7 py-28 text-center">
          <div className="h-px w-16 bg-champagne" aria-hidden />
          <div className="flex flex-col gap-2">
            <p className="font-display text-3xl font-light text-noir lg:text-4xl">
              Your bag is empty
            </p>
            <p className="text-sm leading-relaxed text-stone">
              Add a piece to your bag before checkout.
            </p>
          </div>
          <Button asChild variant="luxury-link">
            <Link href="/collections">
              Explore the Collections
            </Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-12 grid gap-16 lg:grid-cols-[1fr_400px]"
        >
          <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">
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
                  Note <span className="normal-case tracking-normal">(optional)</span>
                </span>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gift note or delivery detail..."
                  className="w-full border border-hairline bg-background px-4 py-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none transition-colors duration-300"
                />
              </label>
            </section>

            <section className="grid gap-5 border-y border-hairline py-6 text-sm leading-relaxed text-stone sm:grid-cols-3">
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Payment
                </p>
                <p className="mt-2">Completed with Stripe on the next step.</p>
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Shipping
                </p>
                <p className="mt-2">{SITE.shippingNote}.</p>
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Returns
                </p>
                <p className="mt-2">Accepted within thirty days, unworn and tagged.</p>
              </div>
            </section>

            {error ? (
              <p
                role="alert"
                className="border border-hairline bg-ivory/50 px-4 py-3 text-sm text-noir"
              >
                {error}
              </p>
            ) : null}
          </div>

          <aside className="flex h-fit flex-col border border-hairline bg-ivory/35 p-7 lg:sticky lg:top-28 lg:p-8">
            <div className="border-b border-hairline pb-5">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
                Summary
              </p>
              <h2 className="mt-2 font-display text-3xl font-light text-noir">
                Your bag
              </h2>
            </div>

            <ul className="mt-5 flex flex-col divide-y divide-hairline">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center gap-4 py-5 text-sm"
                >
                  <div className="relative h-20 w-[3.75rem] shrink-0 bg-ivory">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={`${line.name} - ${line.color} / ${line.size}`}
                        className="size-full object-cover"
                      />
                    ) : null}
                    <span className="absolute right-0 top-0 flex size-5 items-center justify-center bg-warm-white/90 text-[0.625rem] text-noir">
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

            <form onSubmit={handleApply} className="mt-5 flex items-stretch gap-2" aria-label="Apply discount code">
              <label htmlFor="checkout-discount" className="sr-only">
                Discount code
              </label>
              <input
                id="checkout-discount"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Discount code"
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

            <dl className="mt-7 flex flex-col gap-4 text-sm">
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
              className="mt-8 min-h-12 w-full"
              disabled={pending || !email}
            >
              {pending ? "Preparing..." : "Continue to Payment"}
            </Button>

            <Button
              asChild
              variant="ghost"
              className="mt-3 w-full text-xs tracking-[0.24em]"
            >
              <Link href="/cart">Return to Bag</Link>
            </Button>
          </aside>
        </form>
      )}
    </div>
  )
}
