"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/account-actions"
import type { AccountAddressDTO } from "@/lib/data-access/account"

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
] as const

const emptyAddress: AccountAddressDTO = {
  id: "",
  firstName: "",
  lastName: "",
  phone: "",
  province: "",
  city: "",
  area: "",
  streetAddress: "",
  houseApartment: "",
  postalCode: "",
  deliveryNotes: "",
  isDefault: false,
}

const inputClass = "h-12 w-full border border-hairline bg-background px-4 text-sm text-noir focus:border-noir focus:outline-none"

export function AddressBook({ addresses }: { addresses: AccountAddressDTO[] }) {
  const [editing, setEditing] = React.useState<AccountAddressDTO | null>(addresses.length === 0 ? emptyAddress : null)
  const [pending, startTransition] = React.useTransition()

  function save(formData: FormData) {
    startTransition(async () => {
      const res = await saveAddressAction({
        id: formData.get("id") || undefined,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        province: formData.get("province"),
        city: formData.get("city"),
        area: formData.get("area"),
        streetAddress: formData.get("streetAddress"),
        houseApartment: formData.get("houseApartment"),
        postalCode: formData.get("postalCode"),
        deliveryNotes: formData.get("deliveryNotes"),
        isDefault: formData.get("isDefault") === "on",
      })
      if (res.ok) {
        toast.success(res.message)
        setEditing(null)
      } else toast.error(res.error)
    })
  }

  function run(action: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>) {
    startTransition(async () => {
      const res = await action()
      if (res.ok) toast.success(res.message)
      else toast.error(res.error)
    })
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-light text-noir">Saved Addresses</h2>
        <Button type="button" variant="outline" onClick={() => setEditing(emptyAddress)}>Add New Address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-hairline bg-card p-8 text-sm text-stone">No saved addresses yet.</div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="border border-hairline bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-noir">{address.firstName} {address.lastName}</p>
                  {address.isDefault ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-taupe">Default</p> : null}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(address)}>Edit</Button>
              </div>
              <div className="mt-4 text-sm leading-relaxed text-stone">
                <p>{address.phone}</p>
                <p>{address.houseApartment}, {address.streetAddress}</p>
                <p>{address.area}, {address.city}</p>
                <p>{address.province}{address.postalCode ? ` ${address.postalCode}` : ""}</p>
                {address.deliveryNotes ? <p className="mt-2 text-taupe">{address.deliveryNotes}</p> : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {!address.isDefault ? (
                  <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => setDefaultAddressAction({ id: address.id }))}>Set Default</Button>
                ) : null}
                <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => run(() => deleteAddressAction({ id: address.id }))}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <form action={save} className="grid gap-5 border border-hairline bg-card p-6">
          <input type="hidden" name="id" value={editing.id} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="firstName" label="First Name" value={editing.firstName} required />
            <Field name="lastName" label="Last Name" value={editing.lastName} required />
          </div>
          <Field name="phone" label="Phone Number" value={editing.phone} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Province</span>
              <select name="province" required defaultValue={editing.province} className={inputClass}>
                <option value="">Select province</option>
                {PAKISTAN_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
              </select>
            </label>
            <Field name="city" label="City" value={editing.city} required />
          </div>
          <Field name="area" label="Area" value={editing.area} required />
          <Field name="streetAddress" label="Street Address" value={editing.streetAddress} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="houseApartment" label="House / Apartment" value={editing.houseApartment} required />
            <Field name="postalCode" label="Postal Code" value={editing.postalCode} />
          </div>
          <label className="grid gap-2">
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Delivery Notes</span>
            <textarea name="deliveryNotes" defaultValue={editing.deliveryNotes} rows={3} className="w-full border border-hairline bg-background px-4 py-3 text-sm text-noir focus:border-noir focus:outline-none" />
          </label>
          <label className="flex items-center gap-3 text-sm text-stone">
            <input type="checkbox" name="isDefault" defaultChecked={editing.isDefault || addresses.length === 0} className="accent-noir" />
            Set as default address
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Address"}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

function Field({ name, label, value, required = false }: { name: string; label: string; value: string; required?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">{label}</span>
      <input name={name} required={required} defaultValue={value} className={inputClass} />
    </label>
  )
}
