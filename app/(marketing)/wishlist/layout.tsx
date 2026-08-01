import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Saved Pieces",
  description:
    "Your KHZR saved pieces for size, colour and styling decisions.",
  path: "/wishlist",
  noindex: true,
})

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
