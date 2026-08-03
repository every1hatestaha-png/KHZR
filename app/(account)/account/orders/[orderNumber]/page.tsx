import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageIntro } from "@/components/shared/page-intro"
import { OrderSummary } from "@/components/orders/order-summary"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { resolveDbUser } from "@/lib/services/user-service"
import { getAccountOrderDetail } from "@/lib/data-access/orders"
import { formatDate } from "@/lib/utils"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Order Details",
  description: "Your KHZR order details.",
  path: "/account/orders/[orderNumber]",
  noindex: true,
})

export const dynamic = "force-dynamic"

function paymentMethodLabel(value: string): string {
  if (value === "cash_on_delivery") return "Cash on Delivery"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function orderTimeline(order: NonNullable<Awaited<ReturnType<typeof getAccountOrderDetail>>>) {
  return [
    { label: "Order placed", value: order.createdAt },
    order.paymentInitiatedAt ? { label: "Payment initiated", value: order.paymentInitiatedAt } : null,
    order.paymentVerifiedAt ? { label: "Payment verified", value: order.paymentVerifiedAt } : null,
    order.shippingDate ? { label: "Shipped", value: order.shippingDate } : null,
    order.expectedDelivery ? { label: "Expected delivery", value: order.expectedDelivery } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const user = await resolveDbUser()
  const order = user
    ? await getAccountOrderDetail(user.id, orderNumber)
    : null

  if (!user) {
    return (
      <>
        <PageIntro
          kicker="Your Orders"
          title="Sign in to view your orders."
        />
        <section className="mx-auto flex max-w-[1400px] items-center justify-center border-t border-hairline px-5 py-16 lg:px-10">
          <Button asChild size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </section>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <PageIntro
          kicker="Your Orders"
          title="Order not found."
          description="This order could not be found under your account."
        />
        <section className="mx-auto flex max-w-[1400px] items-center justify-center border-t border-hairline px-5 py-16 lg:px-10">
          <Button asChild size="lg" variant="outline">
            <Link href="/account/orders">Back to your orders</Link>
          </Button>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro
        kicker={`Order ${order.orderNumber}`}
        title={`${formatDate(order.createdAt)}`}
        description={`Your order, as it stands. Payment is ${order.paymentStatus.toLowerCase()}.`}
        align="center"
      />

      <section className="mx-auto flex max-w-[800px] flex-col gap-6 border-t border-hairline px-5 pb-24 pt-12 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
            <StatusBadge value={order.fulfillmentStatus} />
          </div>
          <Button asChild variant="ghost" className="text-xs tracking-[0.24em]">
            <Link href="/account/orders">
              <ArrowLeft className="mr-2 size-3.5" />
              All orders
            </Link>
          </Button>
        </div>
        <section className="grid gap-4 border border-hairline bg-card p-6 sm:grid-cols-2">
          <div>
            <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Payment</p>
            <p className="mt-2 font-display text-xl text-noir">{paymentMethodLabel(order.paymentProvider)}</p>
            <p className="mt-1 text-sm text-stone">
              {order.paymentProvider === "cash_on_delivery"
                ? order.paymentStatus === "PAID" ? "Cash collected" : "Cash due on delivery"
                : `Payment is ${order.paymentStatus.toLowerCase()}`}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Delivery</p>
            <p className="mt-2 font-display text-xl text-noir">{order.courier || "Courier pending"}</p>
            <p className="mt-1 text-sm text-stone">{order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Tracking pending"}</p>
          </div>
        </section>
        <section className="border border-hairline bg-card p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Timeline</p>
          <ol className="mt-4 grid gap-3 text-sm text-stone">
            {orderTimeline(order).map((event) => (
              <li key={`${event.label}-${event.value}`} className="flex justify-between gap-4 border-b border-hairline pb-2 last:border-0">
                <span>{event.label}</span>
                <time dateTime={event.value}>{formatDate(event.value)}</time>
              </li>
            ))}
          </ol>
        </section>
        <OrderSummary order={order} />
      </section>
    </>
  )
}
