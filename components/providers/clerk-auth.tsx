"use client"

import * as React from "react"
import { useAuth } from "@clerk/nextjs"

export const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
)

/**
 * Renders children with the signed-in Clerk user id (or null). Only rendered
 * when Clerk is configured, so `useAuth` is always safe here.
 */
export function ClerkAuth({
  children,
}: {
  children: (userId: string | null) => React.ReactNode
}) {
  const { userId } = useAuth()
  return <>{children(userId ?? null)}</>
}
