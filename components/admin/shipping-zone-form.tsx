"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateShippingZoneAction } from "@/lib/actions/shipping-actions"
import { formatMoney } from "@/lib/utils"

type ShippingZoneFormProps = {
  zone: {
    id: string
    name: string
    province: string
    cityMatch: string | null
    amount: unknown
    freeShippingThreshold: unknown
    active: boolean
  }
}

export function ShippingZoneForm({ zone }: ShippingZoneFormProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const amount = Number(zone.amount)
  const threshold = Number(zone.freeShippingThreshold)

  async function submit(formData: FormData) {
    if (busy) return
    setBusy(true)
    const res = await updateShippingZoneAction({
      id: zone.id,
      amount: formData.get("amount"),
      freeShippingThreshold: formData.get("freeShippingThreshold"),
      active: formData.get("active") === "on",
    })
    setBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <form action={submit} className="grid gap-4 border border-hairline bg-card p-5 lg:grid-cols-[1fr_140px_170px_110px_auto] lg:items-end">
      <div>
        <p className="font-display text-xl text-noir">{zone.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-taupe">
          Province: {zone.province} · City: {zone.cityMatch ?? "Any supported city"}
        </p>
        <p className="mt-2 text-sm text-stone">
          Current: {formatMoney(amount, "PKR")} · Free from {formatMoney(threshold, "PKR")}
        </p>
      </div>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">
        Charge
        <Input name="amount" type="number" min="0" step="1" defaultValue={amount} className="rounded-none border-hairline bg-background normal-case tracking-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">
        Free Threshold
        <Input name="freeShippingThreshold" type="number" min="0" step="1" defaultValue={threshold} className="rounded-none border-hairline bg-background normal-case tracking-normal" />
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-taupe lg:pb-2">
        <input name="active" type="checkbox" defaultChecked={zone.active} className="accent-noir" />
        Active
      </label>
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
        Save
      </Button>
    </form>
  )
}
