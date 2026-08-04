"use client"

import * as React from "react"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { HeartIcon, LayoutDashboardIcon, LogOutIcon, MapPinIcon, PackageIcon, SettingsIcon, User } from "lucide-react"
import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"
import { showPendingSignOutToast } from "@/components/account/sign-out-button"
import { OwnerBadge } from "@/components/account/owner-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAccountMenuAction } from "@/lib/actions/account-actions"
import { cn } from "@/lib/utils"

export function AccountMenuClient({ className }: { className?: string }) {
  return <ClerkClientProvider><AccountMenuInner className={className} /></ClerkClientProvider>
}

function AccountMenuInner({ className }: { className?: string }) {
  const { signOut } = useClerk()
  const [menu, setMenu] = React.useState<Awaited<ReturnType<typeof getAccountMenuAction>> | null>(null)
  const [signedOutNow, setSignedOutNow] = React.useState(false)

  React.useEffect(() => {
    showPendingSignOutToast()
    let cancelled = false
    void getAccountMenuAction().then((result) => {
      if (!cancelled) setMenu(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    try {
      setSignedOutNow(true)
      window.sessionStorage.setItem("khzr:signed-out", "1")
      await signOut({ redirectUrl: "/" })
    } catch {
      window.sessionStorage.removeItem("khzr:signed-out")
      setSignedOutNow(false)
      toast.error("We could not sign you out. Please try again.")
    }
  }

  const signedInMenu = menu?.signedIn && !signedOutNow ? menu : null
  const profile = signedInMenu?.profile ?? null
  const name = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your account" : "Your account"
  const initials = name.split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 2) || "KH"
  const imageUrl = profile?.hasImage ? profile.imageUrl : ""
  const base = cn("group inline-flex size-11 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne", className)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={base} aria-label="Your account">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Profile picture" className="size-7 rounded-full border border-hairline object-cover" />
        ) : <User aria-hidden className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone group-focus-visible:text-stone" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="w-[min(calc(100vw-1.5rem),18rem)] rounded-none border-hairline bg-card p-2 shadow-none">
        {!menu ? (
          <DropdownMenuLabel className="p-3 text-xs font-normal text-taupe">Loading account...</DropdownMenuLabel>
        ) : signedInMenu ? (
          <>
            <DropdownMenuLabel className="flex min-w-0 gap-3 p-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Profile picture" className="size-12 shrink-0 rounded-full border border-hairline object-cover" />
              ) : <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-ivory text-sm uppercase text-noir">{initials}</span>}
              <span className="min-w-0"><span className="block truncate font-display text-lg text-noir">{name}</span><span className="block truncate text-xs font-normal text-taupe">{profile?.email || "Verified email unavailable"}</span>{signedInMenu.isAdmin ? <OwnerBadge className="mt-2" /> : null}</span>
            </DropdownMenuLabel>
            {signedInMenu.adminNote ? <DropdownMenuLabel className="px-3 pb-1 pt-0 text-xs font-normal leading-relaxed text-taupe">{signedInMenu.adminNote}</DropdownMenuLabel> : null}
            <DropdownMenuSeparator />
            <MenuLink href="/account/profile" icon={<User />}>Profile</MenuLink>
            <MenuLink href="/account/orders" icon={<PackageIcon />}>Orders</MenuLink>
            <MenuLink href="/account/addresses" icon={<MapPinIcon />}>Saved Addresses</MenuLink>
            <MenuLink href="/wishlist" icon={<HeartIcon />}>Wishlist</MenuLink>
            <MenuLink href="/account/settings" icon={<SettingsIcon />}>Account Settings</MenuLink>
            {signedInMenu.isAdmin ? <MenuLink href="/admin" icon={<LayoutDashboardIcon />} className="border border-champagne/30 bg-champagne/10 text-noir focus:bg-champagne/15">Admin Dashboard</MenuLink> : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(event) => { event.preventDefault(); void handleSignOut() }} className="min-h-11 rounded-none text-destructive focus:text-destructive"><LogOutIcon /> Sign Out</DropdownMenuItem>
          </>
        ) : (
          <><MenuLink href="/sign-in" icon={<User />}>Sign In</MenuLink><MenuLink href="/sign-up" icon={<User />}>Create Account</MenuLink></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuLink({ href, icon, children, className }: { href: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <DropdownMenuItem asChild className={cn("min-h-11 rounded-none", className)}><Link href={href}>{icon}{children}</Link></DropdownMenuItem>
}
