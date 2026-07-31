import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  basePath: string
  params: Record<string, string | undefined>
}

function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  search.set("page", String(page))
  return `${basePath}?${search.toString()}`
}

export function Pagination({ page, totalPages, basePath, params }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)

  const linkClasses = (disabled: boolean) =>
    cn(
      "flex h-9 min-w-9 items-center justify-center border px-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-lux",
      disabled
        ? "pointer-events-none border-transparent text-taupe/50"
        : "border-hairline text-noir hover:border-stone hover:bg-noir/[0.03]"
    )

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 pt-2"
    >
      <Link
        aria-label="Previous page"
        className={linkClasses(page <= 1)}
        href={pageHref(basePath, params, Math.max(1, page - 1))}
      >
        <ChevronLeftIcon className="size-4" />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          aria-current={p === page ? "page" : undefined}
          href={pageHref(basePath, params, p)}
          className={cn(
            linkClasses(false),
            p === page && "border-noir bg-noir text-warm-white hover:bg-noir"
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        aria-label="Next page"
        className={linkClasses(page >= totalPages)}
        href={pageHref(basePath, params, Math.min(totalPages, page + 1))}
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    </nav>
  )
}
