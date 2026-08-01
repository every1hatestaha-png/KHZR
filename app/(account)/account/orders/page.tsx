import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageIntro } from "@/components/shared/page-intro"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { resolveDbUser } from "@/lib/services/user-service"
import { listAccountOrders } from "@/lib/data-access/orders"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Your Orders",
  description: "Your KHZR order history.",
  path: "/account/orders",
  noindex: true,
})

export const dynamic = "force-dynamic"

export default async function AccountOrdersPage() {
  const user = await resolveDbUser()

  if (!user) {
    return (
      <>
        <PageIntro
          kicker="Your Orders"
          title="Sign in to view your orders."
          description="Your order history is tied to your account."
        />
        <section className="mx-auto flex max-w-[1400px] items-center justify-center border-t border-hairline px-5 py-16 lg:px-10">
          <Button asChild size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </section>
      </>
    )
  }

  const orders = await listAccountOrders(user.id)

  return (
    <>
      <PageIntro
        kicker="Your Orders"
        title="Order history."
        description="Every piece, kept in order of arrival."
      />

      <section className="mx-auto flex max-w-[1400px] flex-col gap-6 border-t border-hairline px-5 py-16 lg:px-10">
        <Button asChild variant="ghost" className="w-fit text-xs tracking-[0.24em]">
          <Link href="/account">
            <ArrowLeft className="mr-2 size-3.5" />
            Back to account
          </Link>
        </Button>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-24 text-center">
            <p className="font-display text-2xl font-light text-noir">
              No orders yet
            </p>
            <p className="max-w-md text-sm leading-relaxed text-stone">
              Your purchases will appear here — begin with a single piece.
            </p>
            <Button asChild variant="luxury-link">
              <Link href="/collections">Explore the Collections</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-hairline border border-hairline bg-card">
            {orders.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition-colors hover:bg-noir/[0.02]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-display text-lg text-noir">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-taupe">
                      {formatDate(order.createdAt)} · {order.itemCount} item
                      {order.itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge value={order.status} />
                    <span className="font-display text-lg text-noir">
                      {formatMoney(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
