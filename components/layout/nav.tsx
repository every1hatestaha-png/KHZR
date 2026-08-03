"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

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
          "absolute bottom-0 left-0 h-px bg-champagne transition-transform duration-[260ms] ease-lux motion-reduce:transition-none",
          active ? "w-full" : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  )
}

export function Nav({ className }: { className?: string }) {
  const pathname = usePathname()

  function activeFor(href: string) {
    return pathname === href
  }

  return (
    <nav
      aria-label="Primary"
      className={cn("flex items-center", className)}
    >
      <ul className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <NavLink
              href={link.href}
              label={link.label}
              active={activeFor(link.href)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
