"use client"

import * as React from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import {
  createCheckoutSessionAction,
  quoteCheckoutShippingAction,
  type ShippingQuoteActionResult,
} from "@/lib/actions/checkout-actions"
import { getCheckoutAccountAction } from "@/lib/actions/account-actions"
import { priceBreakdownWithShipping } from "@/lib/services/pricing-service"
import { formatMoney } from "@/lib/utils"
import type { AccountAddressDTO, AccountProfileDTO } from "@/lib/data-access/account"

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
  {
    value: "easypaisa",
    label: "Easypaisa",
    description: "Place the order now. Payment instructions will follow.",
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    description: "Place the order now. Payment instructions will follow.",
  },
] as const

type CheckoutFields = {
  firstName: string
  lastName: string
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
  saveAddress: boolean
}

export default function CheckoutPage() {
  const { cart, discount, applyDiscount, clearDiscount } = useCart()
  const { lines, subtotal, currency } = cart

  const [fields, setFields] = React.useState<CheckoutFields>({
    firstName: "",
    lastName: "",
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
    saveAddress: false,
  })
  const [code, setCode] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [shippingQuote, setShippingQuote] = React.useState<ShippingQuoteActionResult | null>(null)
  const [shippingPending, setShippingPending] = React.useState(false)
  const [accountProfile, setAccountProfile] = React.useState<AccountProfileDTO | null>(null)
  const [savedAddresses, setSavedAddresses] = React.useState<AccountAddressDTO[]>([])
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("")

  const quotedShipping = shippingQuote?.ok ? shippingQuote.shipping : 0
  const pricing = priceBreakdownWithShipping(subtotal, discount, quotedShipping)

  React.useEffect(() => {
    let cancelled = false
    void getCheckoutAccountAction().then((res) => {
      if (cancelled || !res.ok) return
      setAccountProfile(res.profile)
      setSavedAddresses(res.addresses)
      const defaultAddress = res.addresses.find((address) => address.isDefault) ?? res.addresses[0]
      setFields((current) => ({
        ...current,
        firstName: defaultAddress?.firstName || res.profile?.firstName || current.firstName,
        lastName: defaultAddress?.lastName || res.profile?.lastName || current.lastName,
        phone: defaultAddress?.phone || res.profile?.phone || current.phone,
        email: res.profile?.email || current.email,
        province: defaultAddress?.province || current.province,
        city: defaultAddress?.city || current.city,
        area: defaultAddress?.area || current.area,
        streetAddress: defaultAddress?.streetAddress || current.streetAddress,
        houseApartment: defaultAddress?.houseApartment || current.houseApartment,
        postalCode: defaultAddress?.postalCode || current.postalCode,
        notes: defaultAddress?.deliveryNotes || current.notes,
      }))
      if (defaultAddress) setSelectedAddressId(defaultAddress.id)
    })
    return () => {
      cancelled = true
    }
  }, [])

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
      subtotal,
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

  function updateField<K extends keyof CheckoutFields>(
    key: K,
    value: CheckoutFields[K]
  ) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  function selectAddress(id: string) {
    setSelectedAddressId(id)
    const address = savedAddresses.find((item) => item.id === id)
    if (!address) return
    setFields((current) => ({
      ...current,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      area: address.area,
      streetAddress: address.streetAddress,
      houseApartment: address.houseApartment,
      postalCode: address.postalCode,
      notes: address.deliveryNotes,
      saveAddress: false,
    }))
  }

  function useNewAddress() {
    setSelectedAddressId("new")
    setFields((current) => ({
      ...current,
      firstName: accountProfile?.firstName || current.firstName,
      lastName: accountProfile?.lastName || current.lastName,
      phone: accountProfile?.phone || current.phone,
      email: accountProfile?.email || current.email,
      province: "",
      city: "",
      area: "",
      streetAddress: "",
      houseApartment: "",
      postalCode: "",
      notes: "",
      saveAddress: true,
    }))
  }

  function handleApply(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault()
    if (!code.trim()) return
    if (applyDiscount(code.trim())) setCode("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    if (!shippingQuote?.ok) {
      setPending(false)
      setError(shippingQuote?.error ?? "Shipping could not be calculated for this address.")
      return
    }
    const res = await createCheckoutSessionAction({
      ...fields,
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
  const requiredComplete = Boolean(
    fields.firstName &&
      fields.lastName &&
      fields.phone &&
      fields.province &&
      fields.city &&
      fields.area &&
      fields.streetAddress &&
      fields.houseApartment &&
      fields.paymentMethod &&
      shippingQuote?.ok
  )

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
          Enter your delivery details and choose Cash on Delivery, Easypaisa, or JazzCash.
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
          className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1fr_400px] lg:gap-16"
        >
          <div className="flex flex-col gap-10 lg:gap-12">
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">Contact</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="checkout-first-name" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">First Name</span>
                  <input id="checkout-first-name" type="text" required autoComplete="given-name" value={fields.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={inputClass} />
                </label>
                <label htmlFor="checkout-last-name" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Last Name</span>
                  <input id="checkout-last-name" type="text" required autoComplete="family-name" value={fields.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={inputClass} />
                </label>
              </div>
              <label htmlFor="checkout-phone" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Phone Number</span>
                <input id="checkout-phone" type="tel" required autoComplete="tel" inputMode="tel" value={fields.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="03XX XXXXXXX" className={inputClass} />
              </label>
              <label htmlFor="checkout-email" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Email <span className="normal-case tracking-normal">(optional)</span></span>
                <input id="checkout-email" type="email" autoComplete="email" value={fields.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" className={inputClass} />
              </label>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-light text-noir">Delivery address</h2>
              {savedAddresses.length > 0 ? (
                <div className="grid gap-3">
                  <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Saved Addresses</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => selectAddress(address.id)}
                        className={`border p-4 text-left text-sm transition-colors ${selectedAddressId === address.id ? "border-noir bg-ivory/60" : "border-hairline bg-background hover:border-stone"}`}
                      >
                        <span className="block font-display text-lg text-noir">{address.firstName} {address.lastName}</span>
                        <span className="mt-1 block text-stone">{address.houseApartment}, {address.streetAddress}</span>
                        <span className="block text-stone">{address.area}, {address.city}</span>
                        {address.isDefault ? <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-taupe">Default</span> : null}
                      </button>
                    ))}
                  </div>
                  <Button type="button" variant="outline" className="w-fit" onClick={useNewAddress}>Add New Address</Button>
                </div>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="checkout-province" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Province</span>
                  <select id="checkout-province" required autoComplete="address-level1" value={fields.province} onChange={(e) => updateField("province", e.target.value)} className={inputClass}>
                    <option value="">Select province</option>
                    {PAKISTAN_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                  </select>
                </label>
                <label htmlFor="checkout-city" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">City</span>
                  <input id="checkout-city" type="text" required autoComplete="address-level2" value={fields.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
                </label>
              </div>
              <label htmlFor="checkout-area" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Area</span>
                <input id="checkout-area" type="text" required value={fields.area} onChange={(e) => updateField("area", e.target.value)} placeholder="DHA, Gulberg, Clifton..." className={inputClass} />
              </label>
              <label htmlFor="checkout-street" className="flex flex-col gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Street Address</span>
                <input id="checkout-street" type="text" required autoComplete="street-address" value={fields.streetAddress} onChange={(e) => updateField("streetAddress", e.target.value)} className={inputClass} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="checkout-house" className="flex flex-col gap-2">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">House/Apartment</span>
                  <input id="checkout-house" type="text" required value={fields.houseApartment} onChange={(e) => updateField("houseApartment", e.target.value)} className={inputClass} />
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
              {accountProfile ? (
                <label className="flex items-center gap-3 text-sm text-stone">
                  <input type="checkbox" checked={fields.saveAddress} onChange={(e) => updateField("saveAddress", e.target.checked)} className="accent-noir" />
                  Save this address to my account
                </label>
              ) : null}
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
                <p className="mt-2">Cash on Delivery, Easypaisa, or JazzCash.</p>
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
                  {shippingPending
                    ? "Calculating..."
                    : shippingQuote?.ok
                      ? shippingQuote.freeShippingApplied
                        ? "Free shipping applied"
                        : formatMoney(shippingQuote.shipping, currency)
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

            <Button
              type="submit"
              size="lg"
              className="mt-8 min-h-12 w-full"
              disabled={pending || !requiredComplete}
            >
              {pending ? "Placing order..." : "Place Order"}
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
