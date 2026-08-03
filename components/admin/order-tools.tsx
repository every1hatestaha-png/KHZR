"use client"

import { toast } from "sonner"
import { CopyIcon, PrinterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OrderDetailDTO } from "@/lib/data-access/orders"

function addressText(order: OrderDetailDTO) {
  const a = order.shippingAddress
  if (!a) return ""
  return [
    `${a.firstName} ${a.lastName}`,
    a.line1,
    a.line2,
    [a.city, a.region, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean).join("\n")
}

export function OrderTools({ order }: { order: OrderDetailDTO }) {
  async function copy(text: string, message: string) {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  }

  return (
    <div className="grid gap-2 border border-hairline bg-card p-4 print:hidden">
      <Button type="button" variant="outline" onClick={() => window.print()}><PrinterIcon />Print invoice</Button>
      <Button type="button" variant="outline" onClick={() => window.print()}><PrinterIcon />Print packing slip</Button>
      <Button type="button" variant="outline" disabled={!order.shippingAddress} onClick={() => void copy(addressText(order), "Customer address copied.")}><CopyIcon />Copy address</Button>
      <Button type="button" variant="outline" disabled={!order.phone} onClick={() => void copy(order.phone ?? "", "Phone number copied.")}><CopyIcon />Copy phone</Button>
    </div>
  )
}
