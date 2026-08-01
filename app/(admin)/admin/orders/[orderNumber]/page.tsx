import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { OrderStatusControl } from "@/components/admin/order-status-control"
import { OrderSummary } from "@/components/orders/order-summary"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { getAdminOrderDetail } from "@/lib/data-access/orders"

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

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <OrderSummary order={order} />
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
