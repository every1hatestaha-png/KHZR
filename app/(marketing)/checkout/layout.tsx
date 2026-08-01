import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description:
    "Secure KHZR checkout — payment handled by Stripe, your card details are never stored.",
  path: "/checkout",
  noindex: true,
})

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
