"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const SHOP_MENU = [
  {
    href: "/collections?sort=newest",
    label: "New In",
    note: "The current edit",
  },
  {
    href: "/collections",
    label: "All Clothing",
    note: "Dresses, sets, separates",
  },
  {
    href: "/collection/evening",
    label: "Occasion",
    note: "Evening and event dressing",
  },
  {
    href: "/collection/essentials",
    label: "Essentials",
    note: "Quiet everyday pieces",
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
      aria-current={active ? "page" : undefined}
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
  const [mega, setMega] = React.useState(false)

  function activeFor(label: string, href: string) {
    if (label === "Occasion") return pathname === "/collection/evening"
    if (label === "Essentials") return pathname === "/collection/essentials"
    if (label === "Collections") {
      return (
        pathname === "/collections" ||
        (pathname.startsWith("/collection") &&
          pathname !== "/collection/evening" &&
          pathname !== "/collection/essentials")
      )
    }
    if (label === "Shop" || label === "New In") return false
    return pathname === href
  }

  return (
    <nav
      aria-label="Primary"
      className={cn("flex items-center", className)}
    >
      <ul className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <li
            key={`${link.label}-${link.href}`}
            className="group"
            onMouseEnter={() => link.label === "Shop" && setMega(true)}
            onMouseLeave={() => link.label === "Shop" && setMega(false)}
            onFocus={() => link.label === "Shop" && setMega(true)}
            onBlur={(e) => {
              if (
                link.label === "Shop" &&
                !e.currentTarget.contains(e.relatedTarget)
              ) {
                setMega(false)
              }
            }}
          >
            <NavLink
              href={link.href}
              label={link.label}
              active={activeFor(link.label, link.href)}
            />
            {link.label === "Shop" ? (
              <div
                role="menu"
                className={cn(
                  "invisible absolute inset-x-0 top-full z-40 border-b border-hairline bg-background/95 opacity-0 shadow-[0_24px_48px_-24px_rgba(18,17,16,0.12)] backdrop-blur-md transition-all duration-500 ease-lux",
                  mega && "visible opacity-100"
                )}
              >
                <ul
                  className="mx-auto grid max-w-5xl grid-cols-4 gap-8 px-8 py-9"
                  role="none"
                >
                  {SHOP_MENU.map((item) => (
                    <li key={item.href} role="none">
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="group flex flex-col gap-2 border-l border-hairline pl-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                        tabIndex={mega ? 0 : -1}
                        onMouseDown={() => setMega(false)}
                      >
                        <span className="font-display text-xl font-light text-noir transition-colors group-hover:text-stone">
                          {item.label}
                        </span>
                        <span className="text-xs leading-relaxed text-taupe">
                          {item.note}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
