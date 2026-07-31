import { cn } from "@/lib/utils"
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLED: "Fulfilled",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PAID: "Paid",
  FAILED: "Failed",
  UNFULFILLED: "Unfulfilled",
  PARTIALLY_FULFILLED: "Partially fulfilled",
}

const STATUS_TONES: Record<string, string> = {
  PENDING: "border-hairline text-taupe",
  CONFIRMED: "border-hairline text-noir",
  FULFILLED: "border-hairline text-stone",
  SHIPPED: "border-hairline text-stone",
  DELIVERED: "border-hairline text-noir",
  CANCELLED: "border-hairline text-taupe",
  REFUNDED: "border-hairline text-taupe",
  PAID: "border-hairline text-stone",
  FAILED: "border-hairline text-destructive",
}

export function StatusBadge({
  value,
}: {
  value: OrderStatus | PaymentStatus | FulfillmentStatus
}) {
  const tone = STATUS_TONES[value] ?? "border-hairline text-taupe"
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.22em]",
        tone
      )}
    >
      {STATUS_LABELS[value] ?? value}
    </span>
  )
}
