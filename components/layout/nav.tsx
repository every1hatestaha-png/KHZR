"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const COLLECTION_MENU = [
  {
    slug: "tailoring",
    name: "The Tailoring Room",
    note: "Coats, suits, trousers",
  },
  {
    slug: "essentials",
    name: "Crafted Essentials",
    note: "Cashmere, silk, leather",
  },
  {
    slug: "evening",
    name: "The Evening Atelier",
    note: "Gowns in silk",
  },
  {
    slug: "archive",
    name: "Atelier Archive",
    note: "Numbered reissues",
  },
]

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center py-2 text-[0.6875rem] font-medium uppercase tracking-[0.26em] text-noir transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne",
        active && "text-noir"
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0 left-0 h-px bg-champagne transition-transform duration-500 ease-lux",
          active ? "w-full" : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  )
}

export function Nav({ className }: { className?: string }) {
  const pathname = usePathname()
  const isCollections = pathname.startsWith("/collection")
  const [mega, setMega] = React.useState(false)

  return (
    <nav
      aria-label="Primary"
      className={cn("flex items-center", className)}
    >
      <ul className="flex items-center gap-8">
        <li
          className="group"
          onMouseEnter={() => setMega(true)}
          onMouseLeave={() => setMega(false)}
          onFocus={() => setMega(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setMega(false)
          }}
        >
          <NavLink href="/collections" label="Collections" active={isCollections} />
          <div
            className={cn(
              "invisible absolute inset-x-0 top-full z-40 border-b border-hairline bg-background/95 opacity-0 shadow-[0_24px_48px_-24px_rgba(18,17,16,0.18)] backdrop-blur-md transition-all duration-500 ease-lux",
              mega && "visible opacity-100"
            )}
          >
            <div className="mx-auto grid max-w-6xl grid-cols-[1fr_1.4fr] gap-10 px-8 py-10">
              <ul className="flex flex-col">
                <li>
                  <Link
                    href="/collections"
                    className="group flex flex-col gap-1 border-b border-hairline py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                    tabIndex={mega ? 0 : -1}
                    onMouseDown={() => setMega(false)}
                  >
                    <span className="font-display text-xl font-light text-noir transition-colors group-hover:text-stone">
                      All Collections
                    </span>
                    <span className="text-xs text-taupe">
                      The full maison offering
                    </span>
                  </Link>
                </li>
                {COLLECTION_MENU.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/collection/${c.slug}`}
                      className="group flex flex-col gap-1 border-b border-hairline py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                      tabIndex={mega ? 0 : -1}
                      onMouseDown={() => setMega(false)}
                    >
                      <span className="font-display text-xl font-light text-noir transition-colors group-hover:text-stone">
                        {c.name}
                      </span>
                      <span className="text-xs text-taupe">{c.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="relative hidden overflow-hidden bg-sand md:block" aria-hidden>
                <div className="absolute inset-0 bg-gradient-to-t from-noir/20 to-transparent" />
              </div>
            </div>
          </div>
        </li>
        {NAV_LINKS.filter((l) => l.label !== "Collections").map((link) => (
          <li key={link.href}>
            <NavLink
              href={link.href}
              label={link.label}
              active={pathname === link.href}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
