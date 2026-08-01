import { AdminHeading } from "@/components/admin/admin-heading"
import { Pagination } from "@/components/admin/pagination"
import { OrderFilters } from "@/components/admin/order-filters"
import { OrderTable } from "@/components/admin/order-table"
import { listAdminOrders } from "@/lib/data-access/orders"
import { adminOrderListParamsSchema } from "@/lib/validations/checkout"

export const metadata = {
  title: "Orders",
}

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = await searchParams
  const params = adminOrderListParamsSchema.safeParse(raw)
  const parsed = params.success
    ? params.data
    : {
        q: undefined,
        orderNumber: undefined,
        phone: undefined,
        status: undefined,
        paymentStatus: undefined,
        paymentMethod: undefined,
        from: undefined,
        to: undefined,
        page: 1,
        perPage: 15,
      }

  const list = await listAdminOrders({
    q: parsed.q,
    orderNumber: parsed.orderNumber,
    phone: parsed.phone,
    status: parsed.status,
    paymentStatus: parsed.paymentStatus,
    paymentMethod: parsed.paymentMethod,
    from: parsed.from,
    to: parsed.to,
    page: parsed.page,
    perPage: parsed.perPage,
  })

  return (
    <>
      <AdminHeading
        kicker="Commerce"
        title="Orders"
        description="Track, fulfil and refund every order in the maison."
      />

      <OrderFilters
        query={parsed.q ?? ""}
        orderNumber={parsed.orderNumber ?? ""}
        phone={parsed.phone ?? ""}
        status={parsed.status ?? ""}
        paymentStatus={parsed.paymentStatus ?? ""}
        paymentMethod={parsed.paymentMethod ?? ""}
        from={parsed.from ?? ""}
        to={parsed.to ?? ""}
      />

      <OrderTable orders={list.orders} />
      <p className="text-center text-xs uppercase tracking-[0.22em] text-taupe">
        {list.total} order{list.total === 1 ? "" : "s"}
      </p>
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        basePath="/admin/orders"
        params={{
          q: parsed.q,
          orderNumber: parsed.orderNumber,
          phone: parsed.phone,
          status: parsed.status,
          paymentStatus: parsed.paymentStatus,
          paymentMethod: parsed.paymentMethod,
          from: parsed.from,
          to: parsed.to,
        }}
      />
    </>
  )
}
