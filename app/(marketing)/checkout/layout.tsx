import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description:
    "Secure KHZR checkout for Pakistan delivery and Cash on Delivery orders.",
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
