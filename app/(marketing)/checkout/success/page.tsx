import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { OrderSummary } from "@/components/orders/order-summary"
import { StatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import {
  getOrderByOrderNumber,
  getOrderByProviderSessionId,
} from "@/lib/data-access/orders"
import {
  checkoutOrderLookupSchema,
  checkoutSessionIdSchema,
} from "@/lib/validations/checkout"

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
  const parsedSession = checkoutSessionIdSchema.safeParse(raw)
  const order = parsedOrder.success
    ? await getOrderByOrderNumber(parsedOrder.data.order)
    : parsedSession.success
      ? await getOrderByProviderSessionId(parsedSession.data.sessionId)
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
            <Link href="/collections">Explore the Collections</Link>
          </Button>
        </section>
      </>
    )
  }

  const paid = order.paymentStatus === "PAID"
  const localPayment = order.paymentProvider !== "stripe"
  const contact = order.email || order.phone || "your contact details"

  return (
    <>
      <PageIntro
        kicker={paid || localPayment ? "Order confirmed" : "Order received"}
        title={paid || localPayment ? "Thank you." : "Confirming your payment."}
        description={
          paid || localPayment
            ? `Order ${order.orderNumber} is confirmed. We will contact you at ${contact}.`
            : "Your payment is being confirmed. The order details below will update shortly."
        }
        align="center"
      >
        {paid || localPayment ? (
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
            Sign in or create an account to follow order updates and keep saved pieces in one place.
          </p>
          <Button asChild variant="luxury-link" className="mt-4">
            <Link href="/account">Go to Account</Link>
          </Button>
        </div>
        {!paid && !localPayment ? (
          <p className="text-center text-xs uppercase tracking-[0.2em] text-taupe">
            We will email you once payment is confirmed.
          </p>
        ) : null}
      </section>
    </>
  )
}
