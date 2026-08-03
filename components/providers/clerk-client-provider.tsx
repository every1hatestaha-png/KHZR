"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  if (!clerkPublishableKey) return <>{children}</>

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
      {children}
    </ClerkProvider>
  )
}
