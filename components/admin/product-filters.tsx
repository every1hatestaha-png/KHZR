"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminCollectionDTO } from "@/lib/data-access/admin"

type ProductFiltersProps = {
  collections: AdminCollectionDTO[]
  query: string
  status: string
  collection: string
  featured: string
}

export function ProductFilters({
  collections,
  query,
  status,
  collection,
  featured,
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function push(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.delete("page")
    router.replace(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          push({
            q: String(fd.get("q") ?? "").trim() || undefined,
            status: undefined,
            collection: undefined,
            featured: undefined,
          })
        }}
        className="flex w-full items-center gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-taupe" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by name, SKU or slug…"
            className="h-10 rounded-none border-hairline bg-card pl-9"
          />
        </div>
        <Button type="submit" variant="outline" className="h-10 rounded-none">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontalIcon className="size-4 text-taupe" />
        <Select value={status || "all"} onValueChange={(v) => push({ status: v === "all" ? undefined : v })}>
          <SelectTrigger className="h-9 rounded-none border-hairline bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={collection || "all"}
          onValueChange={(v) => push({ collection: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="h-9 rounded-none border-hairline bg-card">
            <SelectValue placeholder="Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={featured || "all"}
          onValueChange={(v) => push({ featured: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="h-9 rounded-none border-hairline bg-card">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Featured</SelectItem>
            <SelectItem value="false">Not featured</SelectItem>
          </SelectContent>
        </Select>

        {(query || status || collection || featured) ? (
          <Button
            variant="ghost"
            className="h-9 rounded-none px-3"
            onClick={() => push({ q: undefined, status: undefined, collection: undefined, featured: undefined })}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
