"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const AccountMenuClient = dynamic(() => import("@/components/layout/account-menu-client").then((m) => m.AccountMenuClient), { ssr: false, loading: () => <FallbackAccountButton /> })

export function AccountButton({ className }: { className?: string }) {
  if (!clerkPublishableKey) return <FallbackAccountButton className={className} />
  return <AccountMenuClient className={className} />
}

function FallbackAccountButton({ className }: { className?: string }) {
  return <Link href="/account" className={cn("group inline-flex size-11 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne", className)} aria-label="Your account"><User aria-hidden className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone group-focus-visible:text-stone" /></Link>
}
