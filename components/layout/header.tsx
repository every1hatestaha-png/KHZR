"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Menu } from "lucide-react"
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
          "relative transition-[border-color,background-color] duration-[320ms] ease-lux motion-reduce:transition-none",
          scrolled
            ? "border-b border-hairline bg-background/92 backdrop-blur-md"
            : "border-b border-transparent bg-background/60 backdrop-blur-sm"
        )}
      >
        <div className="relative mx-auto flex h-14 max-w-[1400px] items-center justify-between px-3 sm:px-5 lg:h-[4.5rem] lg:px-8 xl:px-10">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="inline-flex size-11 items-center justify-center rounded-none text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              <Menu className="size-5 stroke-[1.4] text-noir" />
            </button>
          </div>

          <Link
            href="/"
            aria-label="KHZR — home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
          >
            <span className="font-display text-[1.55rem] font-normal tracking-[0.34em] text-noir sm:text-[1.88rem] sm:tracking-[0.42em] lg:text-[2.15rem]">
              KHZR
            </span>
          </Link>

          <div className="flex items-center justify-end">
            <HeaderActions />
          </div>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
