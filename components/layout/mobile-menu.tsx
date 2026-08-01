"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { NAV_LINKS } from "@/lib/constants"

const SUPPORT_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Account", href: "/sign-in" },
  { label: "Contact", href: "/contact" },
]

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="left"
        className="w-full max-w-sm gap-0 border-r border-hairline bg-background p-0"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-hairline px-7 lg:h-[4.5rem]">
          <span className="font-display text-xl tracking-[0.4em] text-noir">
            KHZR
          </span>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-7 py-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-2.5 font-display text-2xl font-light text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-6 h-px w-full bg-hairline" aria-hidden />

          <ul className="flex flex-col gap-1">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-2.5 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-hairline px-7 py-6">
          <p className="max-w-xs text-sm leading-relaxed text-stone">
            Womenswear in warm neutrals, precise cuts, and easy movement.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
