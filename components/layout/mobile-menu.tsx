"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { NAV_LINKS } from "@/lib/constants"

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
        className="w-[min(100vw,22.5rem)] max-w-none gap-0 border-r border-hairline bg-ivory p-0 text-noir shadow-none"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-14 items-center border-b border-hairline px-5 sm:px-7 lg:h-[4.5rem]">
          <span className="font-display text-xl font-normal tracking-[0.42em] text-noir">
            KHZR
          </span>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-5 py-12 sm:px-7 lg:py-16">
          <ul className="flex flex-col gap-7">
            {NAV_LINKS.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block text-[0.75rem] font-medium uppercase tracking-[0.34em] text-noir transition-colors duration-300 ease-lux hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-hairline px-5 py-6 sm:px-7">
          <p className="max-w-xs text-xs uppercase leading-relaxed tracking-[0.22em] text-taupe">
            Ready to wear eastern dresses. Lahore to Pakistan.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
