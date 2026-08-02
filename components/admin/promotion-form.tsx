"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { savePromotionAction } from "@/lib/actions/promotion-actions"

type PromotionFormValue = {
  id?: string
  name?: string
  code?: string | null
  active?: boolean
  trigger?: string
  scope?: string
  discountType?: string
  percentage?: { toString(): string } | null
  amount?: { toString(): string } | null
  startsAt?: Date | null
  endsAt?: Date | null
  maxUses?: number | null
  usesPerCustomer?: number | null
  minimumOrderValue?: { toString(): string } | null
  products?: Array<{ product: { slug: string } }>
  collections?: Array<{ collection: { slug: string } }>
}

const inputClass = "h-11 w-full border border-hairline bg-background px-3 text-sm text-noir focus:border-noir focus:outline-none"

function dateValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 16) : ""
}

export function PromotionForm({ promotion }: { promotion?: PromotionFormValue | null }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await savePromotionAction({
        id: promotion?.id,
        name: formData.get("name"),
        code: formData.get("code"),
        active: formData.get("active") === "on",
        trigger: formData.get("trigger"),
        scope: formData.get("scope"),
        discountType: formData.get("discountType"),
        percentage: formData.get("percentage"),
        amount: formData.get("amount"),
        startsAt: formData.get("startsAt"),
        endsAt: formData.get("endsAt"),
        maxUses: formData.get("maxUses"),
        usesPerCustomer: formData.get("usesPerCustomer"),
        minimumOrderValue: formData.get("minimumOrderValue"),
        productSlugs: formData.get("productSlugs"),
        collectionSlugs: formData.get("collectionSlugs"),
      })
      if (res.ok) {
        toast.success(res.message)
        router.push(res.id ? `/admin/promotions/${res.id}` : "/admin/promotions")
        router.refresh()
      } else toast.error(res.error)
    })
  }

  return (
    <form action={submit} className="grid gap-5 border border-hairline bg-card p-6">
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Name</span>
        <input name="name" required defaultValue={promotion?.name ?? ""} className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Trigger</span>
          <select name="trigger" defaultValue={promotion?.trigger ?? "COUPON"} className={inputClass}>
            <option value="COUPON">Coupon code</option>
            <option value="AUTOMATIC">Automatic</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Scope</span>
          <select name="scope" defaultValue={promotion?.scope ?? "STORE"} className={inputClass}>
            <option value="STORE">Entire store</option>
            <option value="PRODUCTS">Products</option>
            <option value="COLLECTIONS">Collections</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Discount</span>
          <select name="discountType" defaultValue={promotion?.discountType ?? "PERCENTAGE"} className={inputClass}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field name="code" label="Code" value={promotion?.code ?? ""} />
        <Field name="percentage" label="Percent" value={promotion?.percentage?.toString() ?? ""} type="number" />
        <Field name="amount" label="Amount" value={promotion?.amount?.toString() ?? ""} type="number" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="startsAt" label="Start Date" value={dateValue(promotion?.startsAt)} type="datetime-local" />
        <Field name="endsAt" label="End Date" value={dateValue(promotion?.endsAt)} type="datetime-local" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field name="minimumOrderValue" label="Minimum Order" value={promotion?.minimumOrderValue?.toString() ?? ""} type="number" />
        <Field name="maxUses" label="Maximum Uses" value={promotion?.maxUses?.toString() ?? ""} type="number" />
        <Field name="usesPerCustomer" label="Uses Per Customer" value={promotion?.usesPerCustomer?.toString() ?? ""} type="number" />
      </div>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Product slugs</span>
        <textarea name="productSlugs" defaultValue={promotion?.products?.map((item) => item.product.slug).join("\n") ?? ""} rows={3} className="w-full border border-hairline bg-background px-3 py-2 text-sm text-noir focus:border-noir focus:outline-none" />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Collection slugs</span>
        <textarea name="collectionSlugs" defaultValue={promotion?.collections?.map((item) => item.collection.slug).join("\n") ?? ""} rows={3} className="w-full border border-hairline bg-background px-3 py-2 text-sm text-noir focus:border-noir focus:outline-none" />
      </label>
      <label className="flex items-center gap-3 text-sm text-stone">
        <input type="checkbox" name="active" defaultChecked={promotion?.active ?? true} className="accent-noir" />
        Active
      </label>
      <Button type="submit" disabled={pending} className="w-fit">{pending ? "Saving..." : "Save Promotion"}</Button>
    </form>
  )
}

function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">{label}</span>
      <input name={name} type={type} step={type === "number" ? "0.01" : undefined} defaultValue={value} className={inputClass} />
    </label>
  )
}
