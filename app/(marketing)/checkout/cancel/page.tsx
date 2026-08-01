import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"
import { getOrderByProviderSessionId } from "@/lib/data-access/orders"
import { checkoutSessionIdSchema } from "@/lib/validations/checkout"

export const metadata = buildMetadata({
  title: "Checkout Cancelled",
  description: "Your KHZR checkout was not completed.",
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
        title="Your order was not placed."
        description="No amount has been taken and your selection is still waiting in your bag. You may retry whenever you are ready."
        align="center"
      >
        <ShoppingBag className="size-8 stroke-[1.25] text-taupe/60" aria-hidden />
      </PageIntro>

      <section className="flex items-center justify-center gap-4 border-t border-hairline px-5 py-16">
        <Button asChild size="lg">
          <Link href="/checkout">
            <ArrowLeft className="mr-3 size-4" />
            Return to Checkout
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/collections">Explore the Collections</Link>
        </Button>
      </section>

      {order ? (
        <p className="pb-16 text-center text-xs uppercase tracking-[0.2em] text-taupe">
          Order {order.orderNumber} was not completed.
        </p>
      ) : null}
    </>
  )
}
