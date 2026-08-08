"use client"

import * as React from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import {
  createCheckoutSessionAction,
  quoteCheckoutPromotionAction,
  quoteCheckoutShippingAction,
  type CheckoutPromotionQuoteActionResult,
  type ShippingQuoteActionResult,
} from "@/lib/actions/checkout-actions"
import { analytics, cartLineToAnalyticsItem } from "@/lib/analytics"
import { normalizePakistanMobile } from "@/lib/pakistan-phone"
import { priceBreakdownWithShipping } from "@/lib/services/pricing-service"
import { cn, formatMoney } from "@/lib/utils"

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
] as const

const PAYMENT_METHODS = [
  {
    value: "cash_on_delivery",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
  },
] as const

type CheckoutFields = {
  fullName: string
  phone: string
  email: string
  province: string
  city: string
  area: string
  streetAddress: string
  houseApartment: string
  postalCode: string
  notes: string
  paymentMethod: (typeof PAYMENT_METHODS)[number]["value"]
}

type FieldName =
  | "fullName"
  | "phone"
  | "email"
  | "province"
  | "city"
  | "area"
  | "streetAddress"
  | "houseApartment"

type CheckoutErrors = Partial<Record<FieldName, string>>

const REQUIRED_FIELD_MESSAGES: Record<Exclude<FieldName, "email">, string> = {
  fullName: "Enter your full name.",
  phone: "Enter a valid Pakistan mobile number.",
  province: "Select your province.",
  city: "Enter your city.",
  area: "Enter your area.",
  streetAddress: "Enter your street address.",
  houseApartment: "Enter your house or apartment.",
}

function validateField(name: FieldName, value: string): string | undefined {
  switch (name) {
    case "fullName":
      return !value.trim() || value.trim().length < 2
        ? REQUIRED_FIELD_MESSAGES.fullName
        : undefined
    case "phone":
      return !value.trim() || !normalizePakistanMobile(value)
        ? REQUIRED_FIELD_MESSAGES.phone
        : undefined
    case "email":
      return value.trim() && !/^\S+@\S+\.\S+$/.test(value.trim())
        ? "Enter a valid email address."
        : undefined
    case "province":
      return !value ? REQUIRED_FIELD_MESSAGES.province : undefined
    case "city":
      return !value.trim() ? REQUIRED_FIELD_MESSAGES.city : undefined
    case "area":
      return !value.trim() ? REQUIRED_FIELD_MESSAGES.area : undefined
    case "streetAddress":
      return !value.trim() ? REQUIRED_FIELD_MESSAGES.streetAddress : undefined
    case "houseApartment":
      return !value.trim() ? REQUIRED_FIELD_MESSAGES.houseApartment : undefined
    default:
      return undefined
  }
}

function validateCheckoutFields(fields: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {}
  const names: FieldName[] = [
    "fullName",
    "phone",
    "province",
    "city",
    "area",
    "streetAddress",
    "houseApartment",
  ]
  for (const name of names) {
    const message = validateField(name, fields[name])
    if (message) errors[name] = message
  }
  const emailMessage = validateField("email", fields.email)
  if (emailMessage) errors.email = emailMessage
  return errors
}

const fieldErrorId = (name: FieldName) => `checkout-${name}-error`

export default function CheckoutPage() {
  const { cart } = useCart()
  const { lines, subtotal, currency } = cart

  const [fields, setFields] = React.useState<CheckoutFields>({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    area: "",
    streetAddress: "",
    houseApartment: "",
    postalCode: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  })
  const [code, setCode] = React.useState("")
  const [appliedCode, setAppliedCode] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<CheckoutErrors>({})
  const [shippingQuote, setShippingQuote] = React.useState<ShippingQuoteActionResult | null>(null)
  const [promotionQuote, setPromotionQuote] = React.useState<CheckoutPromotionQuoteActionResult | null>(null)
  const [shippingPending, setShippingPending] = React.useState(false)

  const quotedShipping = shippingQuote?.ok ? shippingQuote.shipping : 0
  const fallbackPricing = priceBreakdownWithShipping(subtotal, null, quotedShipping)
  const pricing = promotionQuote?.ok ? promotionQuote.quote : fallbackPricing

  React.useEffect(() => {
    if (lines.length === 0) return
    analytics.beginCheckout({
      value: subtotal,
      currency,
      items: lines.map(cartLineToAnalyticsItem),
    })
  }, [lines, subtotal, currency])

  React.useEffect(() => {
    if (!fields.province || !fields.city || lines.length === 0) {
      setShippingQuote(null)
      return
    }
    let cancelled = false
    setShippingPending(true)
    void quoteCheckoutShippingAction({
      province: fields.province,
      city: fields.city,
    }).then((quote) => {
      if (!cancelled) {
        setShippingQuote(quote)
        setShippingPending(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [fields.province, fields.city, lines.length, subtotal])

  React.useEffect(() => {
    if (!fields.province || !fields.city || lines.length === 0 || !shippingQuote?.ok) {
      setPromotionQuote(null)
      return
    }
    let cancelled = false
    void quoteCheckoutPromotionAction({
      province: fields.province,
      city: fields.city,
      couponCode: appliedCode,
    }).then((quote) => {
      if (cancelled) return
      setPromotionQuote(quote)
      if (!quote.ok && appliedCode) setError(quote.error)
    })
    return () => {
      cancelled = true
    }
  }, [fields.province, fields.city, lines.length, shippingQuote, appliedCode])

  function updateField<K extends keyof CheckoutFields>(
    key: K,
    value: CheckoutFields[K]
  ) {
    setFields((current) => ({ ...current, [key]: value }))
    const name = key as FieldName
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function handleFieldBlur(name: FieldName, value: string) {
    setErrors((current) => {
      const message = validateField(name, value)
      if (!message) {
        if (!current[name]) return current
        const next = { ...current }
        delete next[name]
        return next
      }
      return { ...current, [name]: message }
    })
  }

  function handleApply(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setError(null)
    setAppliedCode(code.trim().toUpperCase())
    setCode("")
  }

  function removeCoupon() {
    setAppliedCode(null)
    setPromotionQuote(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    const fieldErrors = validateCheckoutFields(fields)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      setError(null)
      return
    }
    setErrors({})
    setPending(true)
    setError(null)
    if (!shippingQuote?.ok) {
      setPending(false)
      setError(
        shippingQuote?.error ??
          "Shipping could not be calculated for this address. Check that your province and city are correct."
      )
      return
    }
    const res = await createCheckoutSessionAction({
      ...fields,
      discountCode: appliedCode ?? "",
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
  const errorClass = "text-[0.6875rem] leading-relaxed text-destructive"
  const validPhone = Boolean(
    fields.phone.trim() && normalizePakistanMobile(fields.phone)
  )
  const requiredComplete = Boolean(
    fields.fullName.trim().length >= 2 &&
      validPhone &&
      fields.province &&
      fields.city.trim() &&
      fields.area.trim() &&
      fields.streetAddress.trim() &&
      fields.houseApartment.trim() &&
      fields.paymentMethod &&
      shippingQuote?.ok
  )

  const diag = process.env.NODE_ENV !== "production" || new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  ).has("diag")
    ? {
        "fullName valid": fields.fullName.trim().length >= 2,
        "phone valid": validPhone,
        "phone raw": JSON.stringify(fields.phone),
        "province valid": Boolean(fields.province),
        "province raw": JSON.stringify(fields.province),
        "city valid": Boolean(fields.city.trim()),
        "city raw": JSON.stringify(fields.city),
        "area valid": Boolean(fields.area.trim()),
        "area raw": JSON.stringify(fields.area),
        "streetAddress valid": Boolean(fields.streetAddress.trim()),
        "streetAddress raw": JSON.stringify(fields.streetAddress),
        "houseApartment valid": Boolean(fields.houseApartment.trim()),
        "houseApartment raw": JSON.stringify(fields.houseApartment),
        "paymentMethod valid": Boolean(fields.paymentMethod),
        "paymentMethod raw": JSON.stringify(fields.paymentMethod),
        "shippingQuote exists": shippingQuote !== null && shippingQuote !== undefined,
        "shippingQuote.ok": Boolean(shippingQuote?.ok),
        "shippingQuote error": shippingQuote?.ok ? null : (shippingQuote?.error ?? null),
        "shippingPending": shippingPending,
        "pending": pending,
        "cart lines.length": lines.length,
        "requiredComplete": requiredComplete,
      }
    : null

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-12 sm:px-5 sm:pt-14 lg:px-10 lg:pt-24">
      <header className="border-b border-hairline pb-9">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
          Pakistan Checkout
        </p>
        <h1 className="mt-4 font-display text-5xl font-light tracking-tight text-noir [overflow-wrap:anywhere] lg:text-6xl">
          Delivery across Pakistan.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          Enter your delivery details and place your order with Cash on Delivery.
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
              Shop Ready to Wear
            </Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1fr_400px] lg:gap-16"
        >
          <div className="flex flex-col gap-10 lg:gap-12">
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">Contact</h2>
              <label htmlFor="checkout-full-name" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Full Name</span>
                <input id="checkout-full-name" type="text" required autoComplete="name" value={fields.fullName} onChange={(e) => updateField("fullName", e.target.value)} onBlur={(e) => handleFieldBlur("fullName", e.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? fieldErrorId("fullName") : undefined} className={cn(inputClass, errors.fullName && "border-destructive")} />
                {errors.fullName ? (
                  <p id={fieldErrorId("fullName")} role="alert" className={errorClass}>{errors.fullName}</p>
                ) : null}
              </label>
              <label htmlFor="checkout-phone" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Phone Number</span>
                <input id="checkout-phone" type="tel" required autoComplete="tel" inputMode="tel" value={fields.phone} onChange={(e) => updateField("phone", e.target.value)} onBlur={(e) => handleFieldBlur("phone", e.target.value)} placeholder="03XX XXXXXXX" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? fieldErrorId("phone") : undefined} className={cn(inputClass, errors.phone && "border-destructive")} />
                {errors.phone ? (
                  <p id={fieldErrorId("phone")} role="alert" className={errorClass}>{errors.phone}</p>
                ) : null}
              </label>
              <label htmlFor="checkout-email" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Email <span className="normal-case tracking-normal">(optional)</span></span>
                <input id="checkout-email" type="email" autoComplete="email" value={fields.email} onChange={(e) => updateField("email", e.target.value)} onBlur={(e) => handleFieldBlur("email", e.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? fieldErrorId("email") : undefined} className={cn(inputClass, errors.email && "border-destructive")} />
                {errors.email ? (
                  <p id={fieldErrorId("email")} role="alert" className={errorClass}>{errors.email}</p>
                ) : null}
              </label>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">Delivery address</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="checkout-province" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Province</span>
                  <select id="checkout-province" required autoComplete="address-level1" value={fields.province} onChange={(e) => updateField("province", e.target.value)} onBlur={(e) => handleFieldBlur("province", e.target.value)} aria-invalid={Boolean(errors.province)} aria-describedby={errors.province ? fieldErrorId("province") : undefined} className={cn(inputClass, errors.province && "border-destructive")}>
                    <option value="">Select province</option>
                    {PAKISTAN_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                  </select>
                  {errors.province ? (
                    <p id={fieldErrorId("province")} role="alert" className={errorClass}>{errors.province}</p>
                  ) : null}
                </label>
                <label htmlFor="checkout-city" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">City</span>
                  <input id="checkout-city" type="text" required autoComplete="address-level2" value={fields.city} onChange={(e) => updateField("city", e.target.value)} onBlur={(e) => handleFieldBlur("city", e.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? fieldErrorId("city") : undefined} className={cn(inputClass, errors.city && "border-destructive")} />
                  {errors.city ? (
                    <p id={fieldErrorId("city")} role="alert" className={errorClass}>{errors.city}</p>
                  ) : null}
                </label>
              </div>
              <label htmlFor="checkout-area" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Area</span>
                <input id="checkout-area" type="text" required value={fields.area} onChange={(e) => updateField("area", e.target.value)} onBlur={(e) => handleFieldBlur("area", e.target.value)} placeholder="DHA, Gulberg, Clifton..." aria-invalid={Boolean(errors.area)} aria-describedby={errors.area ? fieldErrorId("area") : undefined} className={cn(inputClass, errors.area && "border-destructive")} />
                {errors.area ? (
                  <p id={fieldErrorId("area")} role="alert" className={errorClass}>{errors.area}</p>
                ) : null}
              </label>
              <label htmlFor="checkout-street" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Street Address</span>
                <input id="checkout-street" type="text" required autoComplete="street-address" value={fields.streetAddress} onChange={(e) => updateField("streetAddress", e.target.value)} onBlur={(e) => handleFieldBlur("streetAddress", e.target.value)} aria-invalid={Boolean(errors.streetAddress)} aria-describedby={errors.streetAddress ? fieldErrorId("streetAddress") : undefined} className={cn(inputClass, errors.streetAddress && "border-destructive")} />
                {errors.streetAddress ? (
                  <p id={fieldErrorId("streetAddress")} role="alert" className={errorClass}>{errors.streetAddress}</p>
                ) : null}
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="checkout-house" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">House/Apartment</span>
                  <input id="checkout-house" type="text" required value={fields.houseApartment} onChange={(e) => updateField("houseApartment", e.target.value)} onBlur={(e) => handleFieldBlur("houseApartment", e.target.value)} aria-invalid={Boolean(errors.houseApartment)} aria-describedby={errors.houseApartment ? fieldErrorId("houseApartment") : undefined} className={cn(inputClass, errors.houseApartment && "border-destructive")} />
                  {errors.houseApartment ? (
                    <p id={fieldErrorId("houseApartment")} role="alert" className={errorClass}>{errors.houseApartment}</p>
                  ) : null}
                </label>
                <label htmlFor="checkout-postal" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Postal Code <span className="normal-case tracking-normal">(optional)</span></span>
                  <input id="checkout-postal" type="text" autoComplete="postal-code" inputMode="numeric" value={fields.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} className={inputClass} />
                </label>
              </div>
              <label htmlFor="checkout-notes" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Delivery Notes <span className="normal-case tracking-normal">(optional)</span>
                </span>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  value={fields.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Gate, landmark, preferred delivery time..."
                  className="w-full border border-hairline bg-background px-4 py-3 text-sm text-noir placeholder:text-taupe/60 focus:border-noir focus:outline-none transition-colors duration-300"
                />
              </label>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">Payment method</h2>
              <fieldset className="grid gap-3" aria-label="Payment method">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className="flex cursor-pointer items-start gap-3 border border-hairline bg-background p-4 transition-colors hover:border-stone">
                    <input type="radio" name="paymentMethod" value={method.value} checked={fields.paymentMethod === method.value} onChange={() => updateField("paymentMethod", method.value)} className="mt-1 accent-noir" />
                    <span>
                      <span className="block font-display text-lg text-noir">{method.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-stone">{method.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </section>

            <section className="grid gap-5 border-y border-hairline py-6 text-sm leading-relaxed text-stone sm:grid-cols-3">
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Payment
                </p>
                <p className="mt-2">Cash on Delivery.</p>
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Shipping
                </p>
                <p className="mt-2">Calculated from province, city, and order subtotal.</p>
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
                  Returns
                </p>
                <p className="mt-2">Accepted within 7 days after delivery when unused, unwashed, in original condition, with tags attached.</p>
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

          <aside className="flex h-fit flex-col border border-hairline bg-ivory/35 p-5 sm:p-7 lg:sticky lg:top-28 lg:p-8">
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

            <div className="mt-5 flex items-stretch gap-2" aria-label="Apply discount code">
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
                type="button"
                variant="outline"
                size="sm"
                className="h-11"
                disabled={!code.trim()}
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>

            {appliedCode || (promotionQuote?.ok && promotionQuote.quote.promotionName) ? (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.2em] text-taupe">
                  {promotionQuote?.ok && promotionQuote.quote.promotionName
                    ? promotionQuote.quote.promotionName
                    : appliedCode}
                </span>
                {appliedCode ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="uppercase tracking-[0.2em] text-taupe underline-offset-4 hover:text-noir hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
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
                  {shippingPending
                    ? "Calculating..."
                    : shippingQuote?.ok
                      ? pricing.shipping === 0
                        ? "Free shipping applied"
                        : formatMoney(pricing.shipping, currency)
                      : shippingQuote?.error ?? "Shipping calculated at checkout."}
                </dd>
              </div>
              {shippingQuote?.ok ? (
                <div className="flex items-center justify-between">
                  <dt className="text-taupe">Zone</dt>
                  <dd className="text-stone">{shippingQuote.zoneName}</dd>
                </div>
              ) : null}
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

            {!pending && !requiredComplete ? (
              <div className="mt-6 flex flex-col gap-2 text-sm leading-relaxed text-stone">
                {shippingPending ? (
                  <p>Calculating shipping for your address…</p>
                ) : shippingQuote && !shippingQuote.ok ? (
                  <p
                    role="alert"
                    className="border border-hairline bg-ivory/50 px-4 py-3 text-noir"
                  >
                    {shippingQuote.error ?? "Shipping could not be calculated for this address."}
                  </p>
                ) : (
                  <p role="alert">
                    Review the required fields above to place your order.
                  </p>
                )}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="mt-8 min-h-12 w-full"
              disabled={pending || !requiredComplete}
            >
              {pending ? "Placing order..." : "Place Order"}
            </Button>

            {diag ? (
              <pre className="mt-4 whitespace-pre-wrap break-words border border-dashed border-stone/40 bg-background/60 p-3 font-mono text-[0.625rem] leading-relaxed text-stone">
                {JSON.stringify(diag, null, 2)}
              </pre>
            ) : null}

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
