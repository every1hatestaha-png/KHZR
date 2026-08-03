"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ImageIcon,
  PackageIcon,
  ReceiptTextIcon,
  MessageSquareIcon,
  TagsIcon,
  TruckIcon,
  UserRoundIcon,
  WalletCardsIcon,
  SettingsIcon,
  HomeIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: PackageIcon, exact: false },
  { href: "/admin/categories", label: "Categories", icon: FolderIcon, exact: false },
  { href: "/admin/homepage", label: "Homepage", icon: HomeIcon, exact: false },
  { href: "/admin/media", label: "Media", icon: ImageIcon, exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: WalletCardsIcon, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ReceiptTextIcon, exact: false },
  { href: "/admin/customers", label: "Customers", icon: UserRoundIcon, exact: false },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareIcon, exact: false },
  { href: "/admin/promotions", label: "Promotions", icon: TagsIcon, exact: false },
  { href: "/admin/shipping", label: "Shipping", icon: TruckIcon, exact: false },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, exact: false },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="flex w-full shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-hairline bg-ivory/60 px-4 py-3 lg:h-[calc(100vh-4rem)] lg:w-60 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
      <Link
        href="/admin"
        className="mb-2 hidden items-baseline gap-2 px-3 lg:flex"
      >
        <span className="font-display text-2xl font-medium tracking-tight text-noir">
          KHZR
        </span>
        <span className="text-[0.625rem] uppercase tracking-[0.28em] text-taupe">
          Studio
        </span>
      </Link>

      <nav className="flex flex-1 flex-row gap-1 lg:flex-col" aria-label="Admin">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-none px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ease-lux",
                active
                  ? "bg-noir text-warm-white"
                  : "text-taupe hover:bg-noir/[0.05] hover:text-noir"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Link
        href="/"
        className="mt-0 flex shrink-0 items-center gap-2 px-3 py-2 text-[0.625rem] uppercase tracking-[0.22em] text-taupe transition-colors hover:text-noir lg:mt-auto"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to store
      </Link>
    </aside>
  )
}
