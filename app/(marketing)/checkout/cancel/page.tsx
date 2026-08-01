import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { getOrderByProviderSessionId } from "@/lib/data-access/orders"
import { checkoutSessionIdSchema } from "@/lib/validations/checkout"

export const metadata = buildMetadata({
  title: "Checkout Paused",
  description: "Your KHZR checkout is paused and no payment was taken.",
  path: "/checkout/cancel",
  noindex: true,
})

export const dynamic = "force-dynamic"

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = await searchParams
  const parsed = checkoutSessionIdSchema.safeParse(raw)
  const sessionId = parsed.success ? parsed.data.sessionId : null
  const order = sessionId ? await getOrderByProviderSessionId(sessionId) : null

  return (
    <>
      <PageIntro
        kicker="Checkout"
        title="Checkout is paused."
        description="No payment was taken. Your bag is still available when you want to return."
        align="center"
      >
        <span aria-hidden className="h-px w-16 bg-champagne" />
      </PageIntro>

      <section className="flex flex-col items-center justify-center gap-4 border-t border-hairline px-5 py-16 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/checkout">
            Return to Checkout
          </Link>
        </Button>
        <Button asChild variant="luxury-link" size="lg">
          <Link href="/collections">Explore the Collections</Link>
        </Button>
      </section>

      {order ? (
        <p className="pb-16 text-center text-xs uppercase tracking-[0.2em] text-taupe">
          Order {order.orderNumber} is still unpaid.
        </p>
      ) : null}
    </>
  )
}
