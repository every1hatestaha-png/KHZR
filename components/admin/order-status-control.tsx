"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  resendOrderConfirmationAction,
  updateOrderFulfillmentAction,
  updateOrderStatusAction,
} from "@/lib/actions/order-actions"
import type { OrderDetailDTO } from "@/lib/data-access/orders"

const STATUS_OPTIONS: Array<{ value: OrderDetailDTO["status"]; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancel & refund" },
  { value: "REFUNDED", label: "Mark refunded" },
]

const FULFILLMENT_OPTIONS: Array<{
  value: OrderDetailDTO["fulfillmentStatus"]
  label: string
}> = [
  { value: "UNFULFILLED", label: "Unfulfilled" },
  { value: "PARTIALLY_FULFILLED", label: "Partially fulfilled" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Fulfilment cancelled" },
]

export function OrderStatusControl({ order }: { order: OrderDetailDTO }) {
  const router = useRouter()
  const [statusBusy, setStatusBusy] = React.useState(false)
  const [fulfillmentBusy, setFulfillmentBusy] = React.useState(false)
  const [emailBusy, setEmailBusy] = React.useState(false)

  async function changeStatus(value: string) {
    if (statusBusy || value === order.status) return
    setStatusBusy(true)
    const res = await updateOrderStatusAction({
      orderNumber: order.orderNumber,
      status: value,
    })
    setStatusBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function changeFulfillment(value: string) {
    if (fulfillmentBusy || value === order.fulfillmentStatus) return
    setFulfillmentBusy(true)
    const res = await updateOrderFulfillmentAction({
      orderNumber: order.orderNumber,
      fulfillmentStatus: value,
    })
    setFulfillmentBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function resendEmail() {
    if (emailBusy) return
    setEmailBusy(true)
    const res = await resendOrderConfirmationAction(order.orderNumber)
    setEmailBusy(false)
    if (res.ok) {
      toast.success(res.message)
    } else {
      toast.error(res.error)
    }
  }

  const terminal = order.status === "CANCELLED" || order.status === "REFUNDED"

  return (
    <div className="flex flex-col gap-6 border border-hairline bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-light text-noir">
          Order management
        </h2>
        <Button
          variant="outline"
          size="sm"
          disabled={emailBusy}
          onClick={() => void resendEmail()}
        >
          {emailBusy ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : (
            <MailIcon className="size-4" aria-hidden />
          )}
          Resend confirmation
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
            Order status
          </span>
          <Select
            value={order.status}
            onValueChange={(v) => void changeStatus(v)}
            disabled={statusBusy}
          >
            <SelectTrigger aria-label="Order status" className="h-10 rounded-none border-hairline bg-card">
              {statusBusy ? (
                <Loader2Icon className="size-4 animate-spin text-taupe" aria-hidden />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
            Fulfillment
          </span>
          <Select
            value={order.fulfillmentStatus}
            onValueChange={(v) => void changeFulfillment(v)}
            disabled={fulfillmentBusy || terminal}
          >
            <SelectTrigger aria-label="Fulfillment" className="h-10 rounded-none border-hairline bg-card">
              {fulfillmentBusy ? (
                <Loader2Icon className="size-4 animate-spin text-taupe" aria-hidden />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              {FULFILLMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <p className="text-xs leading-relaxed text-taupe">
        Moving an order to <em>Shipped</em> sends the customer their shipping
        confirmation. Cancelling an order that has been paid refunds it through
        Stripe and restores inventory.
      </p>
    </div>
  )
}
