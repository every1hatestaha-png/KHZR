import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { OrderStatusControl } from "@/components/admin/order-status-control"
import { OrderSummary } from "@/components/orders/order-summary"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { getAdminOrderDetail } from "@/lib/data-access/orders"

function paymentMethodLabel(value: string): string {
  if (value === "cash_on_delivery") return "Cash on Delivery"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function stageLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function statusLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export const metadata = {
  title: "Order",
}

export const dynamic = "force-dynamic"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const order = await getAdminOrderDetail(orderNumber)

  if (!order) {
    return (
      <>
        <AdminHeading
          kicker="Commerce"
          title="Order not found."
          description={`No order could be found for ${orderNumber}.`}
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/orders">
                <ArrowLeft />
                All orders
              </Link>
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <AdminHeading
        kicker="Commerce"
        title={order.orderNumber}
        description={`Placed by ${order.email || order.phone || "customer"} · ${order.itemCount} item${
          order.itemCount === 1 ? "" : "s"
        }`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
            <StatusBadge value={order.fulfillmentStatus} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border border-hairline bg-card p-5">
              <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Customer</p>
              <p className="mt-2 text-sm text-stone">{order.email || "No email"}</p>
              <p className="mt-1 font-display text-xl text-noir">{order.phone || "No phone"}</p>
            </div>
            <div className="border border-hairline bg-card p-5">
              <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Payment</p>
              <p className="mt-2 font-display text-xl text-noir">{paymentMethodLabel(order.paymentProvider)}</p>
              <p className="mt-1 text-sm text-stone">{statusLabel(order.paymentStatus)}</p>
              {order.providerTransactionId ? (
                <p className="mt-1 break-all text-xs text-taupe">Txn {order.providerTransactionId}</p>
              ) : null}
              {order.providerReference ? (
                <p className="mt-1 break-all text-xs text-taupe">Ref {order.providerReference}</p>
              ) : null}
            </div>
            <div className="border border-hairline bg-card p-5">
              <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Fulfillment</p>
              <p className="mt-2 font-display text-xl text-noir">{stageLabel(order.fulfillmentStage)}</p>
              <p className="mt-1 text-sm text-stone">{order.fulfillmentStatus}</p>
            </div>
            <div className="border border-hairline bg-card p-5">
              <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Delivery</p>
              <p className="mt-2 font-display text-xl text-noir">{order.courier || "Courier pending"}</p>
              <p className="mt-1 text-sm text-stone">{order.trackingNumber || "No tracking number"}</p>
            </div>
          </section>
          <OrderSummary order={order} />
        </div>
        <div className="flex flex-col gap-6">
          <OrderStatusControl order={order} />
          <Button asChild variant="outline">
            <Link href="/admin/orders">
              <ArrowLeft />
              Back to orders
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
