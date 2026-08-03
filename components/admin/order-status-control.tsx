"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  markPaymentVerifiedAction,
  resendOrderConfirmationAction,
  updateFulfillmentStageAction,
  updateInternalNotesAction,
  updateOrderFulfillmentAction,
  updateOrderStatusAction,
  updateShippingDetailsAction,
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

const STAGE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const

function paymentMethodLabel(value: string): string {
  if (value === "cash_on_delivery") return "Cash on Delivery"
  if (value === "easypaisa") return "Easypaisa"
  if (value === "jazzcash") return "JazzCash"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function dateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : ""
}

function timeline(order: OrderDetailDTO) {
  return [
    { label: "Order placed", value: order.createdAt },
    order.paymentVerifiedAt ? { label: "Payment verified", value: order.paymentVerifiedAt } : null,
    order.shippingDate ? { label: "Shipping date", value: order.shippingDate } : null,
    order.expectedDelivery ? { label: "Expected delivery", value: order.expectedDelivery } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>
}

export function OrderStatusControl({ order }: { order: OrderDetailDTO }) {
  const router = useRouter()
  const [statusBusy, setStatusBusy] = React.useState(false)
  const [fulfillmentBusy, setFulfillmentBusy] = React.useState(false)
  const [stageBusy, setStageBusy] = React.useState(false)
  const [paymentBusy, setPaymentBusy] = React.useState(false)
  const [shippingBusy, setShippingBusy] = React.useState(false)
  const [notesBusy, setNotesBusy] = React.useState(false)
  const [emailBusy, setEmailBusy] = React.useState(false)

  async function changeStatus(value: string) {
    if (statusBusy || value === order.status) return
    if ((value === "CANCELLED" || value === "REFUNDED") && !window.confirm("This order action cannot be undone. Continue?")) return
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

  async function changeStage(value: string) {
    if (stageBusy || value === order.fulfillmentStage) return
    if (value === "cancelled" && !window.confirm("Cancel this order and restore reserved inventory if eligible?")) return
    setStageBusy(true)
    const res = await updateFulfillmentStageAction({
      orderNumber: order.orderNumber,
      fulfillmentStage: value,
    })
    setStageBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function verifyPayment() {
    if (paymentBusy || order.paymentStatus === "PAID") return
    if (order.paymentProvider === "cash_on_delivery" && !window.confirm("Mark COD cash as collected for this order?")) return
    setPaymentBusy(true)
    const res = await markPaymentVerifiedAction({ orderNumber: order.orderNumber })
    setPaymentBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function saveShipping(formData: FormData) {
    if (shippingBusy) return
    setShippingBusy(true)
    const res = await updateShippingDetailsAction({
      orderNumber: order.orderNumber,
      courier: String(formData.get("courier") ?? ""),
      trackingNumber: String(formData.get("trackingNumber") ?? ""),
      shippingDate: String(formData.get("shippingDate") ?? ""),
      expectedDelivery: String(formData.get("expectedDelivery") ?? ""),
    })
    setShippingBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function saveNotes(formData: FormData) {
    if (notesBusy) return
    setNotesBusy(true)
    const res = await updateInternalNotesAction({
      orderNumber: order.orderNumber,
      internalNotes: String(formData.get("internalNotes") ?? ""),
    })
    setNotesBusy(false)
    if (res.ok) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const terminal = order.status === "CANCELLED" || order.status === "REFUNDED"
  const walletPayment = order.paymentProvider === "easypaisa" || order.paymentProvider === "jazzcash"
  const paymentLabel = order.paymentProvider === "cash_on_delivery" ? "Pending COD" : walletPayment ? "Awaiting Payment" : "Pending"

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
            Pakistan fulfillment
          </span>
          <Select
            value={order.fulfillmentStage}
            onValueChange={(v) => void changeStage(v)}
            disabled={stageBusy}
          >
            <SelectTrigger aria-label="Pakistan fulfillment" className="h-10 rounded-none border-hairline bg-card">
              {stageBusy ? <Loader2Icon className="size-4 animate-spin text-taupe" aria-hidden /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

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

      <section className="border-t border-hairline pt-5">
        <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Payment workflow</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-stone">
          <div>
            <p className="font-display text-xl text-noir">{paymentMethodLabel(order.paymentProvider)}</p>
            <p>{order.paymentStatus === "PAID" ? (walletPayment ? "Payment Verified" : "Paid") : paymentLabel}</p>
          </div>
          <Button variant="outline" disabled={paymentBusy || order.paymentStatus === "PAID"} onClick={() => void verifyPayment()}>
            {paymentBusy ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
            {order.paymentProvider === "cash_on_delivery" ? "Mark COD Collected" : walletPayment ? "Mark Payment Verified" : "Mark Paid"}
          </Button>
        </div>
      </section>

      <form action={saveShipping} className="grid gap-4 border-t border-hairline pt-5">
        <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Delivery fields</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">Courier<Input name="courier" defaultValue={order.courier ?? ""} className="rounded-none border-hairline bg-card normal-case tracking-normal" /></label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">Tracking Number<Input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="rounded-none border-hairline bg-card normal-case tracking-normal" /></label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">Shipping Date<Input name="shippingDate" type="date" defaultValue={dateInputValue(order.shippingDate)} className="rounded-none border-hairline bg-card normal-case tracking-normal" /></label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-taupe">Expected Delivery<Input name="expectedDelivery" type="date" defaultValue={dateInputValue(order.expectedDelivery)} className="rounded-none border-hairline bg-card normal-case tracking-normal" /></label>
        </div>
        <Button type="submit" variant="outline" disabled={shippingBusy}>
          {shippingBusy ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          Save delivery fields
        </Button>
      </form>

      <form action={saveNotes} className="grid gap-3 border-t border-hairline pt-5">
        <label className="flex flex-col gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Internal admin notes</span>
          <textarea name="internalNotes" defaultValue={order.internalNotes ?? ""} rows={5} className="w-full border border-hairline bg-card px-3 py-2 text-sm text-noir focus:border-noir focus:outline-none" />
        </label>
        <Button type="submit" variant="outline" disabled={notesBusy}>
          {notesBusy ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          Save internal notes
        </Button>
      </form>

      <section className="border-t border-hairline pt-5">
        <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Order timeline</p>
        <ol className="mt-3 space-y-3 text-sm text-stone">
          {timeline(order).map((event) => (
            <li key={`${event.label}-${event.value}`} className="flex justify-between gap-4 border-b border-hairline pb-2 last:border-0">
              <span>{event.label}</span>
              <time dateTime={event.value}>{new Date(event.value).toLocaleDateString()}</time>
            </li>
          ))}
          <li className="flex justify-between gap-4 border-b border-hairline pb-2 last:border-0">
            <span>Current fulfillment</span>
            <span>{STAGE_OPTIONS.find((stage) => stage.value === order.fulfillmentStage)?.label ?? order.fulfillmentStage}</span>
          </li>
        </ol>
      </section>

      <p className="text-xs leading-relaxed text-taupe">
        Moving an order to <em>Shipped</em> sends the customer their shipping
        confirmation. Cancelling an eligible order restores reserved inventory;
        mark COD paid only after cash has been collected.
      </p>
    </div>
  )
}
