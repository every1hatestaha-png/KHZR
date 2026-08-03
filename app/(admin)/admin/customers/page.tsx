import Link from "next/link"
import { SearchIcon, UserRoundIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { Pagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  adminCustomerDisplayName,
  getAdminCustomers,
} from "@/lib/data-access/admin"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = { title: "Customers" }
export const dynamic = "force-dynamic"

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = await searchParams
  const q = stringParam(raw.q)?.trim() ?? ""
  const newsletter = stringParam(raw.newsletter)
  const page = Math.max(1, Number(stringParam(raw.page) ?? "1") || 1)
  const list = await getAdminCustomers({ q, newsletter: newsletter === "true" || newsletter === "false" ? newsletter : undefined, page, perPage: 15 })

  return (
    <>
      <AdminHeading
        kicker="Customers"
        title="Customers"
        description="Find customer profiles, contact details, addresses and order history."
        actions={<Button asChild variant="outline"><Link href="/admin/customers/export">Export CSV</Link></Button>}
      />

      <form className="flex flex-col gap-3 border border-hairline bg-card p-4 sm:flex-row" action="/admin/customers">
        <label className="sr-only" htmlFor="customer-search">Search customers</label>
        <Input
          id="customer-search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, phone or Clerk id"
          className="bg-warm-white"
        />
        <select name="newsletter" defaultValue={newsletter ?? ""} className="h-10 border border-hairline bg-warm-white px-3 text-sm">
          <option value="">All customers</option>
          <option value="true">Newsletter subscribers</option>
          <option value="false">Not subscribed</option>
        </select>
        <Button type="submit" variant="outline">
          <SearchIcon className="size-4" aria-hidden />
          Search
        </Button>
      </form>

      {list.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <UserRoundIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">No customers match.</p>
          <p className="max-w-sm text-sm leading-relaxed text-stone">
            Try a different name, email or phone number.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-hairline bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Customers</caption>
            <thead className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Spend</th>
                <th className="px-4 py-3 font-medium">Last order</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((customer) => (
                <tr key={customer.id} className="border-b border-hairline last:border-0 hover:bg-noir/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium text-noir hover:underline">
                      {adminCustomerDisplayName(customer)}
                    </Link>
                    <p className="text-xs text-taupe">{customer.role}{customer.newsletter ? " · Newsletter" : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-stone">
                    <p>{customer.email ?? "No email"}</p>
                    <p className="text-xs text-taupe">{customer.phone ?? "No phone"}</p>
                  </td>
                  <td className="px-4 py-3 text-stone">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-stone">{formatMoney(customer.totalSpend)}</td>
                  <td className="px-4 py-3 text-stone">{customer.lastOrderAt ? formatDate(customer.lastOrderAt.toISOString()) : "Never"}</td>
                  <td className="px-4 py-3 text-stone">{formatDate(customer.createdAt.toISOString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-xs uppercase tracking-[0.22em] text-taupe">
        {list.total} customer{list.total === 1 ? "" : "s"}
      </p>
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        basePath="/admin/customers"
        params={{ q: q || undefined, newsletter: newsletter || undefined }}
      />
    </>
  )
}
