import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your order with KHZR.",
  path: "/checkout",
})

export default function CheckoutPage() {
  return (
    <>
      <PageIntro
        kicker="Secure Checkout"
        title="Almost there."
        description="The checkout is being set with the payment provider — payment sessions, order confirmation and delivery tracking."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <Button asChild size="lg">
          <Link href="/cart">Return to Your Selection</Link>
        </Button>
      </section>
    </>
  )
}
