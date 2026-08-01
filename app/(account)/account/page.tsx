import Link from "next/link"
import { ArrowRight, Heart, Package } from "lucide-react"
import { PageIntro } from "@/components/shared/page-intro"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { resolveDbUser } from "@/lib/services/user-service"
import { listAccountOrders } from "@/lib/data-access/orders"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Account",
  description: "Manage your KHZR account.",
  path: "/account",
  noindex: true,
})

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const user = await resolveDbUser()

  if (!user) {
    return (
      <>
        <PageIntro
          kicker="Your Account"
          title="Your KHZR account."
          description="Orders, address book and saved pieces — secured by Clerk."
        />
        <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
          <Button asChild size="lg">
            <Link href="/sign-in">
              Sign in to your account
              <ArrowRight className="ml-3 size-4" />
            </Link>
          </Button>
        </section>
      </>
    )
  }

  const orders = await listAccountOrders(user.id)
  const recent = orders.slice(0, 4)

  return (
    <>
      <PageIntro
        kicker="Your Account"
        title="Welcome back."
        description="Orders and saved pieces, kept quietly in order."
      />

      <section className="mx-auto flex max-w-[1400px] flex-col gap-10 border-t border-hairline px-5 py-16 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/account/orders"
            className="group flex flex-col gap-6 border border-hairline bg-card p-8 transition-colors duration-300 ease-lux hover:border-stone"
          >
            <Package className="size-6 text-taupe transition-colors group-hover:text-noir" />
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-light text-noir">
                  Orders
                </p>
                <p className="mt-1 text-sm text-taupe">
                  {orders.length === 0
                    ? "No orders yet"
                    : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <ArrowRight className="size-4 text-taupe transition-all group-hover:translate-x-1 group-hover:text-noir" />
            </div>
          </Link>
          <Link
            href="/wishlist"
            className="group flex flex-col gap-6 border border-hairline bg-card p-8 transition-colors duration-300 ease-lux hover:border-stone"
          >
            <Heart className="size-6 text-taupe transition-colors group-hover:text-noir" />
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-light text-noir">
                  Saved pieces
                </p>
                <p className="mt-1 text-sm text-taupe">Your wishlist</p>
              </div>
              <ArrowRight className="size-4 text-taupe transition-all group-hover:translate-x-1 group-hover:text-noir" />
            </div>
          </Link>
        </div>

        {recent.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-light text-noir">
                Recent orders
              </h2>
              <Button asChild variant="luxury-link">
                <Link href="/account/orders">View all</Link>
              </Button>
            </div>
            <ul className="divide-y divide-hairline border border-hairline bg-card">
              {recent.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-noir/[0.02]"
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
          </section>
        ) : (
          <section className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
            <p className="font-display text-2xl font-light text-noir">
              No orders yet
            </p>
            <Button asChild variant="luxury-link">
              <Link href="/collections">Begin with a single piece</Link>
            </Button>
          </section>
        )}
      </section>
    </>
  )
}
