"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { khzrClerkAppearance } from "@/lib/clerk-appearance"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  if (!clerkPublishableKey) return <>{children}</>

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={khzrClerkAppearance}>
      {children}
    </ClerkProvider>
  )
}
