import type { OrderDetailDTO } from "@/lib/data-access/orders"
import { TAX_LABEL } from "@/lib/constants"
import { formatDate, formatMoney } from "@/lib/utils"

function AddressBlock({
  title,
  address,
}: {
  title: string
  address: OrderDetailDTO["shippingAddress"]
}) {
  if (!address) return null
  return (
    <div>
      <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
        {title}
      </p>
      <address className="mt-2 text-sm not-italic leading-relaxed text-stone">
        {address.firstName} {address.lastName}
        <br />
        {address.line1}
        {address.line2 ? (
          <>
            <br />
            {address.line2}
          </>
        ) : null}
        <br />
        {address.city}
        {address.region ? `, ${address.region}` : ""} {address.postalCode}
        <br />
        {address.country}
      </address>
    </div>
  )
}

function paymentMethodLabel(value: string): string {
  if (value === "cash_on_delivery") return "Cash on Delivery"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function OrderSummary({
  order,
}: {
  order: OrderDetailDTO
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="border border-hairline bg-ivory/35">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl font-light text-noir">{order.orderNumber}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-taupe">
              {formatDate(order.createdAt)}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-taupe">
              {paymentMethodLabel(order.paymentProvider)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-taupe">
              {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
            </span>
          </div>
        </header>

        <ul className="divide-y divide-hairline">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 px-6 py-4 text-sm"
            >
              <div className="relative size-14 shrink-0 bg-ivory">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-light text-noir">
                  {item.name}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                  {item.color} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-display text-lg font-light text-noir">
                {formatMoney(item.unitPrice * item.quantity, order.currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-4 border-t border-hairline px-6 py-6 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-taupe">Subtotal</dt>
            <dd className="text-noir">{formatMoney(order.subtotal, order.currency)}</dd>
          </div>
          {order.discountTotal > 0 ? (
            <div className="flex items-center justify-between">
              <dt className="text-taupe">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd className="text-champagne">
                −{formatMoney(order.discountTotal, order.currency)}
              </dd>
            </div>
          ) : null}
          {order.promotionType ? (
            <div className="flex items-center justify-between">
              <dt className="text-taupe">Promotion type</dt>
              <dd className="text-noir">{order.promotionType.replace("_", " ").toLowerCase()}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt className="text-taupe">Shipping</dt>
            <dd className="text-noir">
              {order.shippingTotal > 0
                ? formatMoney(order.shippingTotal, order.currency)
                : order.freeShippingApplied
                  ? "Free shipping applied"
                  : "Complimentary"}
            </dd>
          </div>
          {order.shippingZone ? (
            <div className="flex items-center justify-between">
              <dt className="text-taupe">Shipping zone</dt>
              <dd className="text-noir">{order.shippingZone}</dd>
            </div>
          ) : null}
          {order.taxTotal > 0 ? (
            <div className="flex items-center justify-between">
              <dt className="text-taupe">{TAX_LABEL}</dt>
              <dd className="text-noir">{formatMoney(order.taxTotal, order.currency)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-hairline pt-4">
            <dt className="text-[0.6875rem] uppercase tracking-[0.24em] text-noir">
              Total
            </dt>
            <dd className="font-display text-xl text-noir">
              {formatMoney(order.total, order.currency)}
            </dd>
          </div>
        </dl>
      </section>

      {order.shippingAddress || order.billingAddress ? (
        <section className="grid gap-8 border border-hairline bg-background p-6 sm:grid-cols-2">
          <AddressBlock title="Ship to" address={order.shippingAddress} />
          <AddressBlock title="Bill to" address={order.billingAddress} />
        </section>
      ) : null}

      {order.phone || order.email ? (
        <section className="border border-hairline bg-background p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
            Contact
          </p>
          <div className="mt-2 text-sm leading-relaxed text-stone">
            {order.phone ? <p>{order.phone}</p> : null}
            {order.email ? <p>{order.email}</p> : null}
          </div>
        </section>
      ) : null}

      {order.customerNotes ? (
        <section className="border border-hairline bg-background p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
            Order note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            {order.customerNotes}
          </p>
        </section>
      ) : null}
    </div>
  )
}
