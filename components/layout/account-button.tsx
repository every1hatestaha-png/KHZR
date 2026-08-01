"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export function AccountButton({ className }: { className?: string }) {
  const icon = (
    <User
      aria-hidden
      className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone group-focus-visible:text-stone"
    />
  )
  const base = cn(
    "group inline-flex size-11 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
    className
  )

  if (!clerkEnabled) {
    return (
      <Link href="/sign-in" className={base} aria-label="Sign in">
        {icon}
      </Link>
    )
  }

  return <AccountButtonSigned icon={icon} base={base} />
}

function AccountButtonSigned({
  icon,
  base,
}: {
  icon: React.ReactNode
  base: string
}) {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return (
      <Link href="/account" className={base} aria-label="Your account">
        {icon}
      </Link>
    )
  }

  return (
    <Link href="/sign-in" className={base} aria-label="Sign in">
      {icon}
    </Link>
  )
}
