import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Your Selection",
  description:
    "Your KHZR selection — pieces held while you decide, with complimentary shipping on orders over the threshold.",
  path: "/cart",
  noindex: true,
})

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
