import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, MapPinIcon, ReceiptTextIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { Button } from "@/components/ui/button"
import {
  adminCustomerDisplayName,
  getAdminCustomerDetail,
} from "@/lib/data-access/admin"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = { title: "Customer" }
export const dynamic = "force-dynamic"

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getAdminCustomerDetail(id)
  if (!customer) notFound()
  const name = adminCustomerDisplayName(customer)

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/customers">
          <ArrowLeftIcon className="size-4" aria-hidden />
          Customers
        </Link>
      </Button>

      <AdminHeading
        kicker="Customer"
        title={name}
        description={`${customer.orderCount} order${customer.orderCount === 1 ? "" : "s"} · ${formatMoney(customer.totalSpend)} lifetime spend`}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Email" value={customer.email ?? "No email"} />
        <Stat label="Phone" value={customer.phone ?? "No phone"} />
        <Stat label="Newsletter" value={customer.newsletter ? "Subscribed" : "Not subscribed"} />
        <Stat label="Joined" value={formatDate(customer.createdAt.toISOString())} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="border border-hairline bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPinIcon className="size-4 text-taupe" aria-hidden />
            <h2 className="font-display text-2xl text-noir">Addresses</h2>
          </div>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-stone">No saved addresses.</p>
          ) : (
            <div className="grid gap-4">
              {customer.addresses.map((address) => (
                <address key={address.id} className="not-italic text-sm leading-relaxed text-stone">
                  <p className="font-medium text-noir">
                    {address.firstName} {address.lastName}
                    {address.isDefault ? <span className="ml-2 text-xs uppercase tracking-[0.18em] text-champagne">Default</span> : null}
                  </p>
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  {address.area ? <p>{address.area}</p> : null}
                  <p>{[address.city, address.region, address.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{address.country}</p>
                  {address.phone ? <p className="text-taupe">{address.phone}</p> : null}
                  {address.deliveryNotes ? <p className="mt-1 text-xs text-taupe">{address.deliveryNotes}</p> : null}
                </address>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-hairline bg-card">
          <div className="flex items-center gap-2 border-b border-hairline p-5">
            <ReceiptTextIcon className="size-4 text-taupe" aria-hidden />
            <h2 className="font-display text-2xl text-noir">Orders</h2>
          </div>
          {customer.orders.length === 0 ? (
            <p className="p-5 text-sm text-stone">No orders yet.</p>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.orderNumber} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.orderNumber}`} className="font-medium text-noir hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone">{formatDate(order.createdAt.toISOString())}</td>
                    <td className="px-4 py-3 text-stone">{order.itemCount}</td>
                    <td className="px-4 py-3 text-stone">{order.status}</td>
                    <td className="px-4 py-3 text-stone">{order.paymentStatus}</td>
                    <td className="px-4 py-3 text-right font-display text-lg text-noir">{formatMoney(order.total, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline bg-card p-4">
      <p className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-noir">{value}</p>
    </div>
  )
}
