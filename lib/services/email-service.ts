import "server-only"

import { Resend } from "resend"
import { SITE, TAX_LABEL } from "@/lib/constants"
import { formatDate, formatMoney } from "@/lib/utils"

export type OrderEmailLine = {
  name: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  imageUrl?: string | null
}

export type OrderEmailAddress = {
  firstName: string
  lastName: string
  phone?: string | null
  line1: string
  line2?: string | null
  area?: string | null
  city: string
  region?: string | null
  postalCode: string
  country: string
  deliveryNotes?: string | null
}

export type OrderEmailData = {
  orderNumber: string
  email: string
  phone?: string | null
  createdAt: Date
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  currency: string
  paymentProvider: string
  paymentStatus?: string
  lines: OrderEmailLine[]
  shippingAddress?: OrderEmailAddress | null
  status?: string
  notes?: string | null
}

function esc(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatAddress(address?: OrderEmailAddress | null): string {
  if (!address) return ""
  const lines = [
    `${esc(address.firstName)} ${esc(address.lastName)}`,
    address.phone ? esc(address.phone) : "",
    esc(address.line1),
    address.line2 ? esc(address.line2) : "",
    address.area ? esc(address.area) : "",
    `${esc(address.city)}${address.region ? `, ${esc(address.region)}` : ""} ${esc(address.postalCode)}`,
    esc(address.country),
    address.deliveryNotes ? `Notes: ${esc(address.deliveryNotes)}` : "",
  ].filter((line) => line.length > 0)
  return lines.map((line) => `<div>${line}</div>`).join("")
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(value)
}

function itemsHtml(lines: OrderEmailLine[], currency: string): string {
  return lines
    .map((line) => {
      const row = [
        `<td style="padding:12px 0;border-bottom:1px solid #E4DCCD;vertical-align:top">`,
        `<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#121110">${esc(line.name)}</div>`,
        `<div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A7B6C;margin-top:3px">${esc(line.color)} · ${esc(line.size)} · Qty ${line.quantity}</div>`,
        `</td>`,
        `<td style="padding:12px 0;border-bottom:1px solid #E4DCCD;text-align:right;vertical-align:top;white-space:nowrap;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#121110">${formatMoney(line.unitPrice * line.quantity, currency)}</td>`,
      ].join("")
      return `<tr>${row}</tr>`
    })
    .join("")
}

function totalsHtml(data: OrderEmailData): string {
  const rows: Array<[string, string]> = [
    ["Subtotal", formatMoney(data.subtotal, data.currency)],
  ]
  if (data.discount > 0) {
    rows.push(["Discount", `−${formatMoney(data.discount, data.currency)}`])
  }
  rows.push(["Shipping", data.shipping > 0 ? formatMoney(data.shipping, data.currency) : "Complimentary"])
  if (data.tax > 0) {
    rows.push([TAX_LABEL, formatMoney(data.tax, data.currency)])
  }
  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8A7B6C">${esc(label)}</td><td style="padding:4px 0;text-align:right;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#121110;${strong ? "font-size:18px" : ""}">${value}</td></tr>`
  return rows
    .map(([label, value]) => line(label, value))
    .join("") + line("Total", formatMoney(data.total, data.currency), true)
}

function shell({
  kicker,
  title,
  body,
}: {
  kicker: string
  title: string
  body: string
}): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)} — ${SITE.name}</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;color:#121110;font-family:Inter,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E4DCCD">
  <tr>
    <td style="padding:32px 40px 24px;border-bottom:1px solid #E4DCCD">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:0.42em;color:#121110;text-align:center">${SITE.name}</div>
      <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A7B6C;text-align:center;margin-top:6px">${esc(SITE.tagline)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:40px 40px 8px">
      <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#C2A878">${esc(kicker)}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;color:#121110;margin-top:10px">${esc(title)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 40px 40px">${body}</td>
  </tr>
  <tr>
    <td style="padding:24px 40px 36px;background:#F3EEE6">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#121110;text-align:center">${SITE.name} — ${SITE.tagline}</div>
      <div style="font-size:11px;color:#8A7B6C;text-align:center;margin-top:8px;line-height:1.6">${esc(SITE.address.line1)} · ${esc(SITE.address.city)}, ${esc(SITE.address.region)} ${esc(SITE.address.postalCode)}<br />${esc(SITE.email)}</div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!to) return false
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const resend = new Resend(apiKey)
  try {
    const { error } = await resend.emails.send({
      from: `${SITE.name} <${process.env.EMAIL_FROM ?? SITE.email}>`,
      to,
      subject,
      html,
    })
    if (error) {
      console.error("[email] send failed:", error.message)
      return false
    }
    return true
  } catch (err) {
    console.error("[email] send threw:", err instanceof Error ? err.message : "unknown")
    return false
  }
}

export async function sendOwnerOrderNotificationEmail(
  data: OrderEmailData
): Promise<boolean> {
  const to = process.env.KHZR_ORDER_NOTIFICATION_EMAIL
  if (!to) return false

  const address = data.shippingAddress
  const adminHref = `${SITE.url}/admin/orders/${encodeURIComponent(data.orderNumber)}`
  const infoRows: Array<[string, string]> = [
    ["Order number", data.orderNumber],
    ["Date and time", formatDateTime(data.createdAt)],
    ["Customer", `${address?.firstName ?? ""} ${address?.lastName ?? ""}`.trim()],
    ["Phone", data.phone || address?.phone || "Not provided"],
    ["Email", data.email || "Not provided"],
    ["Province", address?.region || "Not provided"],
    ["City", address?.city || "Not provided"],
    ["Area", address?.area || "Not provided"],
    ["Payment method", data.paymentProvider],
    ["Payment status", data.paymentStatus || "PENDING"],
  ]
  const row = ([label, value]: [string, string]) =>
    `<tr><td style="padding:7px 12px 7px 0;border-bottom:1px solid #E4DCCD;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8A7B6C;vertical-align:top">${esc(label)}</td><td style="padding:7px 0;border-bottom:1px solid #E4DCCD;font-size:13px;color:#121110;vertical-align:top">${esc(value)}</td></tr>`
  const body = [
    `<div style="font-size:14px;line-height:1.7;color:#5C5248">A new order has been placed on ${esc(SITE.name)}.</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">${infoRows.map(row).join("")}</table>`,
    address
      ? `<div style="margin-top:24px"><div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C;margin-bottom:8px">Complete delivery address</div><div style="font-size:13px;line-height:1.7;color:#121110">${formatAddress(address)}</div></div>`
      : "",
    data.notes
      ? `<div style="margin-top:18px;font-size:13px;color:#5C5248;line-height:1.6"><span style="letter-spacing:0.16em;text-transform:uppercase;font-size:10px;color:#8A7B6C">Delivery notes</span><br />${esc(data.notes)}</div>`
      : "",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">${itemsHtml(data.lines, data.currency)}</table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">${totalsHtml(data)}</table>`,
    `<div style="margin-top:28px"><a href="${esc(adminHref)}" style="display:inline-block;background:#121110;color:#FAF7F2;text-decoration:none;padding:12px 18px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">View admin order</a></div>`,
  ].join("")

  return sendEmail(
    to,
    `New order ${data.orderNumber}`,
    shell({ kicker: "New order", title: `Order ${data.orderNumber}`, body })
  )
}

export async function sendOrderConfirmationEmail(
  data: OrderEmailData
): Promise<boolean> {
  const paymentCopy = data.paymentProvider === "cash_on_delivery"
    ? "Cash on Delivery is selected; payment is due when your order is delivered."
    : "We will update you as your payment and order are processed."
  const body = [
    `<div style="font-size:14px;line-height:1.7;color:#5C5248">Thank you for your order. We are preparing your pieces and will email you again once they ship.</div>`,
    `<div style="font-size:13px;line-height:1.7;color:#5C5248;margin-top:12px">${esc(paymentCopy)}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td style="padding-bottom:4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C">Order ${esc(data.orderNumber)}</td><td style="padding-bottom:4px;text-align:right;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C">${esc(formatDate(data.createdAt))}</td></tr></table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${itemsHtml(data.lines, data.currency)}</table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">${totalsHtml(data)}</table>`,
    data.shippingAddress
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #E4DCCD;padding-top:16px"><tr><td style="vertical-align:top;padding-right:20px"><div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C;margin-bottom:8px">Ship to</div><div style="font-size:13px;line-height:1.7;color:#121110">${formatAddress(data.shippingAddress)}</div></td></tr></table>`
      : "",
    data.notes
      ? `<div style="margin-top:24px;font-size:13px;color:#8A7B6C;line-height:1.6"><span style="letter-spacing:0.16em;text-transform:uppercase;font-size:10px;color:#8A7B6C">Your note</span><br />${esc(data.notes)}</div>`
      : "",
  ].join("")
  return sendEmail(
    data.email,
    `Order ${data.orderNumber} — Confirmation`,
    shell({ kicker: "Order confirmed", title: "Thank you for your order", body })
  )
}

export async function sendShippingConfirmationEmail(
  data: OrderEmailData
): Promise<boolean> {
  const body = [
    `<div style="font-size:14px;line-height:1.7;color:#5C5248">Your order has shipped and is on its way.</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td style="padding-bottom:4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C">Order ${esc(data.orderNumber)}</td></tr></table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${itemsHtml(data.lines, data.currency)}</table>`,
    data.shippingAddress
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #E4DCCD;padding-top:16px"><tr><td style="vertical-align:top;padding-right:20px"><div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C;margin-bottom:8px">Ship to</div><div style="font-size:13px;line-height:1.7;color:#121110">${formatAddress(data.shippingAddress)}</div></td></tr></table>`
      : "",
  ].join("")
  return sendEmail(
    data.email,
    `Order ${data.orderNumber} — On its way`,
    shell({ kicker: "Dispatch", title: "Your order has shipped", body })
  )
}

export async function sendOrderStatusEmail(
  data: OrderEmailData,
  statusLabel: string
): Promise<boolean> {
  const body = [
    `<div style="font-size:14px;line-height:1.7;color:#5C5248">A note on order ${esc(data.orderNumber)}: its status is now <strong style="color:#121110">${esc(statusLabel)}</strong>.</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td style="padding-bottom:4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8A7B6C">Order ${esc(data.orderNumber)}</td></tr></table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${itemsHtml(data.lines, data.currency)}</table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">${totalsHtml(data)}</table>`,
  ].join("")
  return sendEmail(
    data.email,
    `Order ${data.orderNumber} — ${statusLabel}`,
    shell({ kicker: "Order update", title: `Order ${statusLabel}`, body })
  )
}

export async function sendPaymentFailedEmail(
  data: OrderEmailData
): Promise<boolean> {
  const body = [
    `<div style="font-size:14px;line-height:1.7;color:#5C5248">We could not complete the payment for order ${esc(data.orderNumber)}. No amount has been taken and your order has not been placed. You may retry from your bag at any time.</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">${totalsHtml(data)}</table>`,
  ].join("")
  return sendEmail(
    data.email,
    `Order ${data.orderNumber} — Payment not completed`,
    shell({ kicker: "Payment", title: "We could not complete your payment", body })
  )
}
