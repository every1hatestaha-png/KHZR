import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { OrderSummary } from "@/components/orders/order-summary"
import { PurchaseTracker } from "@/components/analytics/purchase-tracker"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { getOrderByOrderNumber } from "@/lib/data-access/orders"
import { checkoutOrderLookupSchema } from "@/lib/validations/checkout"

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
  const parsedOrder = checkoutOrderLookupSchema.safeParse(raw)
  const order = parsedOrder.success
    ? await getOrderByOrderNumber(parsedOrder.data.order)
    : null

  if (!order) {
    return (
      <>
        <PageIntro
          kicker="Checkout"
          title="We could not find that order."
          description="Return to your selection and begin again. Your bag is untouched."
          align="center"
        />
        <section className="flex items-center justify-center border-t border-hairline px-5 py-16">
          <Button asChild size="lg">
            <Link href="/collections">Shop Ready to Wear</Link>
          </Button>
        </section>
      </>
    )
  }

  const paid = order.paymentStatus === "PAID"
  const cod = order.paymentProvider === "cash_on_delivery"
  const contact = order.email || order.phone || "your contact details"

  return (
    <>
      {(paid || cod) ? <PurchaseTracker order={order} /> : null}
      <PageIntro
        kicker={paid || cod ? "Order confirmed" : "Order received"}
        title={paid || cod ? "Thank you." : "Awaiting payment."}
        description={
          paid || cod
            ? `Order ${order.orderNumber} is confirmed. We will contact you at ${contact}.`
            : "Your order has been created and is waiting for confirmation."
        }
        align="center"
      >
        {paid || cod ? (
          <span aria-hidden className="h-px w-16 bg-champagne" />
        ) : null}
      </PageIntro>

      <section className="mx-auto flex max-w-[860px] flex-col gap-7 border-t border-hairline px-4 pb-24 pt-10 sm:px-5 sm:pt-12 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusBadge value={order.status} />
          <Link
            href="/collections"
            className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe underline-offset-4 transition-colors hover:text-noir hover:underline focus-visible:outline-2 focus-visible:outline-champagne"
          >
            Continue shopping
          </Link>
        </div>
        <OrderSummary order={order} />
        <div className="border-t border-hairline pt-6 text-center text-sm leading-relaxed text-stone">
          <p>
            We will contact you at {contact} with order updates and delivery
            details.
          </p>
        </div>
        {!paid && !cod ? (
          <p className="text-center text-xs uppercase tracking-[0.2em] text-taupe">
            We will email you once payment is confirmed.
          </p>
        ) : null}
      </section>
    </>
  )
}
