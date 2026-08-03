"use client"

import Link from "next/link"
import { FileTextIcon, SearchXIcon } from "lucide-react"
import { StatusBadge } from "@/components/orders/order-status"
import { formatDate, formatMoney } from "@/lib/utils"
import type { OrderSummaryDTO } from "@/lib/data-access/orders"

type OrderTableProps = {
  orders: OrderSummaryDTO[]
}

function paymentMethodLabel(value: string): string {
  if (value === "cash_on_delivery") return "COD"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function stageLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
        <SearchXIcon className="size-6 text-taupe" aria-hidden />
        <p className="font-display text-2xl font-light text-noir">
          No orders match.
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-stone">
          Adjust the search or filters to see other orders.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-hairline">
      <table className="w-full min-w-[880px] text-left text-sm" role="table">
        <caption className="sr-only">Orders</caption>
        <thead>
          <tr className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
            <th scope="col" className="px-4 py-3 font-medium">Order</th>
            <th scope="col" className="px-4 py-3 font-medium">Customer</th>
            <th scope="col" className="px-4 py-3 font-medium">Items</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Method</th>
            <th scope="col" className="px-4 py-3 font-medium">Payment</th>
            <th scope="col" className="px-4 py-3 font-medium">Fulfillment</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.orderNumber}
              className="border-b border-hairline last:border-0 hover:bg-noir/[0.02]"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.orderNumber}`}
                  className="group flex flex-col gap-0.5"
                >
                  <span className="inline-flex items-center gap-2 font-medium text-noir transition-colors group-hover:text-stone">
                    <FileTextIcon className="size-3.5 text-taupe" aria-hidden />
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-taupe">
                    {formatDate(order.createdAt)}
                  </span>
                  {order.reviewFlagged ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-champagne">
                      Admin review
                    </span>
                  ) : null}
                </Link>
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-taupe">
                {order.email || order.phone || "No contact"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-taupe">
                {order.itemCount}
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={order.status} />
              </td>
              <td className="px-4 py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-taupe">
                  {paymentMethodLabel(order.paymentProvider)}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={order.paymentStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-taupe">
                {stageLabel(order.fulfillmentStage)}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg text-noir">
                {formatMoney(order.total, order.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
