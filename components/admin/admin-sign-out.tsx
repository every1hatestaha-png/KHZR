"use client"

import * as React from "react"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"
import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"
import { cn } from "@/lib/utils"

export function AdminSignOut({ className }: { className?: string }) {
  return (
    <ClerkClientProvider>
      <AdminSignOutInner className={className} />
    </ClerkClientProvider>
  )
}

function AdminSignOutInner({ className }: { className?: string }) {
  const { signOut } = useClerk()
  const [pending, setPending] = React.useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void signOut({ redirectUrl: "/" }).catch(() => {
          setPending(false)
          toast.error("We could not sign you out. Please try again.")
        })
      }}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-none px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ease-lux",
        className
      )}
    >
      <LogOutIcon className="size-4" />
      Sign Out
    </button>
  )
}
