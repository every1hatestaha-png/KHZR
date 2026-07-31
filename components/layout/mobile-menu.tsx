"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { FOOTER_LINKS, NAV_LINKS } from "@/lib/constants"

const MOBILE_COLLECTIONS = [
  { label: "All Collections", href: "/collections" },
  { label: "The Tailoring Room", href: "/collection/tailoring" },
  { label: "Crafted Essentials", href: "/collection/essentials" },
  { label: "The Evening Atelier", href: "/collection/evening" },
  { label: "Atelier Archive", href: "/collection/archive" },
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
        className="w-full max-w-sm gap-0 border-r-hairline bg-background p-0"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-hairline px-7">
          <span className="font-display text-xl tracking-[0.4em] text-noir">
            KHZR
          </span>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-7 py-6">
          <ul className="flex flex-col gap-1">
            {MOBILE_COLLECTIONS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  onClick={onClose}
                  className="block py-2.5 font-display text-2xl font-light text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-6 h-px w-full bg-hairline" aria-hidden />

          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="block py-2.5 font-display text-2xl font-light text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-hairline px-7 py-6">
          <ul className="flex flex-col gap-3">
            {[...FOOTER_LINKS.house, ...FOOTER_LINKS.client].slice(0, 4).map(
              (l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-champagne"
                  >
                    {l.label}
                  </Link>
                </li>
              )
            )}
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/sign-in"
              onClick={onClose}
              className="text-[0.6875rem] uppercase tracking-[0.24em] text-noir focus-visible:outline-2 focus-visible:outline-champagne"
            >
              Account
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
