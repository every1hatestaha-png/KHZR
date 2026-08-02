"use client"

import * as React from "react"
import { analytics } from "@/lib/analytics"
import type { OrderDetailDTO } from "@/lib/data-access/orders"

export function PurchaseTracker({ order }: { order: OrderDetailDTO }) {
  React.useEffect(() => {
    const key = `khzr_purchase_${order.orderNumber}`
    if (window.sessionStorage.getItem(key)) return
    window.sessionStorage.setItem(key, "1")
    analytics.purchase({
      orderNumber: order.orderNumber,
      value: order.total,
      currency: order.currency,
      shipping: order.shippingTotal,
      discount: order.discountTotal,
      paymentMethod: order.paymentProvider,
      items: order.items.map((item) => ({
        item_id: item.sku,
        item_name: item.name,
        item_variant: [item.color, item.size].filter(Boolean).join(" / "),
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    })
  }, [order])
  return null
}
