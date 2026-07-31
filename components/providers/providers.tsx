"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { WishlistProvider } from "@/components/wishlist/wishlist-provider"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function Providers({ children }: { children: React.ReactNode }) {
  const app = (
    <>
      <CartProvider>
        <WishlistProvider>
          {children}
          <CartDrawer />
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

  if (clerkPublishableKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        appearance={{
          variables: {
            colorPrimary: "#121110",
            colorBackground: "#FAF7F2",
            fontFamily: "Inter, sans-serif",
            borderRadius: "0",
          },
        }}
      >
        {app}
      </ClerkProvider>
    )
  }

  return app
}
