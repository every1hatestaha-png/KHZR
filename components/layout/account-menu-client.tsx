"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { HeartIcon, LayoutDashboardIcon, LogOutIcon, MapPinIcon, PackageIcon, SettingsIcon, User } from "lucide-react"
import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"
import { showPendingSignOutToast } from "@/components/account/sign-out-button"
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
  const router = useRouter()
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
    setSignedOutNow(true)
    window.sessionStorage.setItem("khzr:signed-out", "1")
    await signOut({ redirectUrl: "/" })
    router.refresh()
  }

  const signedInMenu = menu?.signedIn && !signedOutNow ? menu : null
  const profile = signedInMenu?.profile ?? null
  const name = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your account" : ""
  const base = cn("group inline-flex size-11 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne", className)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={base} aria-label="Your account">
        {profile?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.imageUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : <User aria-hidden className="size-4.5 stroke-[1.4] text-noir transition-colors group-hover:text-stone group-focus-visible:text-stone" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-none border-hairline bg-card p-2 shadow-none">
        {signedInMenu && profile ? (
          <>
            <DropdownMenuLabel className="flex gap-3 p-3">
              {profile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.imageUrl} alt="" className="size-12 rounded-full object-cover" />
              ) : <span className="flex size-12 items-center justify-center rounded-full bg-noir text-sm uppercase text-warm-white">{name.slice(0, 2) || "KH"}</span>}
              <span className="min-w-0"><span className="block truncate font-display text-lg text-noir">{name}</span><span className="block truncate text-xs font-normal text-taupe">{profile.email || "Verified email unavailable"}</span></span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <MenuLink href="/account/profile" icon={<User />}>Profile</MenuLink>
            <MenuLink href="/account/orders" icon={<PackageIcon />}>Orders</MenuLink>
            <MenuLink href="/account/addresses" icon={<MapPinIcon />}>Saved Addresses</MenuLink>
            <MenuLink href="/wishlist" icon={<HeartIcon />}>Wishlist</MenuLink>
            <MenuLink href="/account/settings" icon={<SettingsIcon />}>Account Settings</MenuLink>
            {signedInMenu.isAdmin ? <MenuLink href="/admin" icon={<LayoutDashboardIcon />}>Admin Dashboard</MenuLink> : null}
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

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <DropdownMenuItem asChild className="min-h-11 rounded-none"><Link href={href}>{icon}{children}</Link></DropdownMenuItem>
}
