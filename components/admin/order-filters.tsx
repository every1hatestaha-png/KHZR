"use client"

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

type OrderFiltersProps = {
  query: string
  status: string
  paymentStatus: string
}

export function OrderFilters({
  query,
  status,
  paymentStatus,
}: OrderFiltersProps) {
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
            paymentStatus: undefined,
          })
        }}
        className="flex w-full items-center gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by order number, email or note…"
            aria-label="Search orders"
            className="h-10 rounded-none border-hairline bg-card pl-9"
          />
        </div>
        <Button type="submit" variant="outline" className="h-10 rounded-none">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontalIcon className="size-4 text-taupe" aria-hidden />
        <Select
          value={status || "all"}
          onValueChange={(v) => push({ status: v === "all" ? undefined : v })}
        >
          <SelectTrigger aria-label="Filter by status" className="h-9 rounded-none border-hairline bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="FULFILLED">Fulfilled</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus || "all"}
          onValueChange={(v) =>
            push({ paymentStatus: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger aria-label="Filter by payment" className="h-9 rounded-none border-hairline bg-card">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {query || status || paymentStatus ? (
          <Button
            variant="ghost"
            className="h-9 rounded-none px-3"
            onClick={() =>
              push({ q: undefined, status: undefined, paymentStatus: undefined })
            }
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
