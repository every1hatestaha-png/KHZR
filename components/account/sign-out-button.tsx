"use client"

import * as React from "react"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"
import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"
import { Button } from "@/components/ui/button"

const SIGN_OUT_TOAST_KEY = "khzr:signed-out"
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function showPendingSignOutToast() {
  if (typeof window === "undefined") return
  if (window.sessionStorage.getItem(SIGN_OUT_TOAST_KEY) !== "1") return
  window.sessionStorage.removeItem(SIGN_OUT_TOAST_KEY)
  toast.success("You have been signed out.")
}

export function SignOutButton({ variant = "outline" }: { variant?: React.ComponentProps<typeof Button>["variant"] }) {
  if (!clerkPublishableKey) return null
  return <ClerkClientProvider><SignOutButtonInner variant={variant} /></ClerkClientProvider>
}

function SignOutButtonInner({ variant }: { variant: React.ComponentProps<typeof Button>["variant"] }) {
  const { signOut } = useClerk()

  async function handleSignOut() {
    try {
      window.sessionStorage.setItem(SIGN_OUT_TOAST_KEY, "1")
      await signOut({ redirectUrl: "/" })
    } catch {
      window.sessionStorage.removeItem(SIGN_OUT_TOAST_KEY)
      toast.error("We could not sign you out. Please try again.")
    }
  }

  return <Button type="button" variant={variant} className="min-h-11" onClick={() => void handleSignOut()}><LogOutIcon />Sign Out</Button>
}
