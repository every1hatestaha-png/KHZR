"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/components/cart/cart-provider"
import { WishlistProvider } from "@/components/wishlist/wishlist-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"

const CartDrawer = dynamic(
  () =>
    import("@/components/cart/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartProvider>
        <WishlistProvider>
          {children}
          <CartDrawer />
          <React.Suspense fallback={null}>
            <AnalyticsProvider />
          </React.Suspense>
        </WishlistProvider>
      </CartProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-none !border !border-hairline !bg-popover !font-sans !text-noir !shadow-none",
            title: "!font-display !text-base !font-normal",
            description: "!text-xs !text-taupe",
          },
        }}
      />
    </>
  )
}
