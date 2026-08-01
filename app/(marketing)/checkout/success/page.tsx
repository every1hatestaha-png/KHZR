import Link from "next/link"
import { Check, PackageSearch } from "lucide-react"
import { PageIntro } from "@/components/shared/page-intro"
import { OrderSummary } from "@/components/orders/order-summary"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { getOrderByProviderSessionId } from "@/lib/data-access/orders"
import { checkoutSessionIdSchema } from "@/lib/validations/checkout"

export const metadata = buildMetadata({
  title: "Order Confirmed",
  description: "Your KHZR order has been placed.",
  path: "/checkout/success",
  noindex: true,
})

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = await searchParams
  const parsed = checkoutSessionIdSchema.safeParse(raw)
  const sessionId = parsed.success ? parsed.data.sessionId : null
  const order = sessionId ? await getOrderByProviderSessionId(sessionId) : null

  if (!order) {
    return (
      <>
        <PageIntro
          kicker="Checkout"
          title="We could not find that order."
          description="Return to your selection and begin again — your bag is untouched."
        />
        <section className="flex items-center justify-center border-t border-hairline px-5 py-16">
          <Button asChild size="lg">
            <Link href="/collections">Explore the Collections</Link>
          </Button>
        </section>
      </>
    )
  }

  const paid = order.paymentStatus === "PAID"

  return (
    <>
      <PageIntro
        kicker={paid ? "Order confirmed" : "Order received"}
        title={paid ? "Thank you." : "Confirming your payment"}
        description={
          paid
            ? `Order ${order.orderNumber} is confirmed. A confirmation email is on its way to ${order.email}.`
            : "Your payment is being confirmed. The order details below will be finalised momentarily."
        }
        align="center"
      >
        {paid ? (
          <span
            aria-hidden
            className="flex size-14 items-center justify-center rounded-full bg-champagne/20 text-champagne"
          >
            <Check className="size-6" />
          </span>
        ) : null}
      </PageIntro>

      <section className="mx-auto flex max-w-[800px] flex-col gap-6 border-t border-hairline px-5 pb-24 pt-12 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge value={order.status} />
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe transition-colors hover:text-noir"
          >
            <PackageSearch className="size-4" aria-hidden />
            Continue exploring
          </Link>
        </div>
        <OrderSummary order={order} />
        {!paid ? (
          <p className="text-center text-xs uppercase tracking-[0.2em] text-taupe">
            You will receive a confirmation email once payment clears.
          </p>
        ) : null}
      </section>
    </>
  )
}
