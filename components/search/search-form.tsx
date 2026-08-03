"use client"

import * as React from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchForm({ query }: { query: string }) {
  const [value, setValue] = React.useState(query)

  React.useEffect(() => {
    setValue(query)
  }, [query])

  return (
    <form action="/search" role="search" className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
      <label htmlFor="storefront-search" className="sr-only">
        Search KHZR products
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-taupe" aria-hidden />
        <input
          id="storefront-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={80}
          placeholder="Search by name, color, fabric, or collection"
          className="h-12 w-full border border-hairline bg-background pl-11 pr-12 text-sm text-noir placeholder:text-taupe/70 focus:border-noir focus:outline-none"
        />
        {value ? (
          <Link
            href="/search"
            aria-label="Clear search"
            className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            onClick={() => setValue("")}
          >
            <X className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      <Button type="submit" className="h-12 px-8 text-[0.6875rem] uppercase tracking-[0.24em]">
        Search
      </Button>
    </form>
  )
}
