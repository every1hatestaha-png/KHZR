"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Nav } from "@/components/layout/nav"
import { HeaderActions } from "@/components/layout/header-actions"
import { useScrollPosition } from "@/hooks/use-scroll-position"
import { cn } from "@/lib/utils"

const MobileMenu = dynamic(
  () => import("@/components/layout/mobile-menu").then((m) => m.MobileMenu),
  { ssr: false }
)

export function Header() {
  const scrolled = useScrollPosition(12)
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "relative transition-[border-color,background-color,box-shadow] duration-500 ease-lux",
          scrolled
            ? "border-b border-hairline bg-background/90 shadow-[0_12px_32px_-24px_rgba(18,17,16,0.12)] backdrop-blur-md"
            : "border-b border-transparent bg-background/60 backdrop-blur-sm"
        )}
      >
        <div className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:h-[4.5rem] lg:px-10">
          <div className="flex items-center lg:w-[30%]">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex size-9 items-center justify-center rounded-none lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              <Menu className="size-5 stroke-[1.4] text-noir" />
            </button>
            <Nav className="hidden lg:flex" />
          </div>

          <Link
            href="/"
            aria-label="KHZR — home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
          >
            <span className="font-display text-[1.75rem] font-normal tracking-[0.42em] text-noir lg:text-[2rem]">
              KHZR
            </span>
          </Link>

          <div className="flex items-center justify-end lg:w-[30%]">
            <HeaderActions />
          </div>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
