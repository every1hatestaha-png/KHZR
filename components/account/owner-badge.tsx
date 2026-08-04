import { cn } from "@/lib/utils"

/**
 * Subtle champagne marker shown only to the store owner. Renders in both
 * server and client trees — no hooks, no client boundary.
 */
export function OwnerBadge({
  label = "Store Owner",
  className,
}: {
  label?: "Store Owner" | "Admin"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 border border-champagne/45 bg-champagne/10 px-2 py-0.5",
        "text-[0.5625rem] font-medium uppercase tracking-[0.22em] text-champagne",
        className
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-champagne" />
      {label}
    </span>
  )
}
