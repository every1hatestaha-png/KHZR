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
          <StatusBadge value={order.status} />
          <Button asChild variant="ghost" className="text-xs tracking-[0.24em]">
            <Link href="/account/orders">
              <ArrowLeft className="mr-2 size-3.5" />
              All orders
            </Link>
          </Button>
        </div>
        <OrderSummary order={order} />
      </section>
    </>
  )
}
