import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAccess } from "@/lib/services/admin-auth"
import { rateLimit } from "@/lib/services/rate-limit"

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`
}

export async function GET(request: NextRequest) {
  const denied = await requireAdminAccess()
  if (denied) return new NextResponse(denied, { status: 403 })
  const allowed = await rateLimit("admin:orders-export", 10, 60 * 60 * 1000)
  if (!allowed) return new NextResponse("Too many exports.", { status: 429 })
  const sp = request.nextUrl.searchParams
  const where = {
    ...(sp.get("status") ? { status: sp.get("status") as never } : {}),
    ...(sp.get("paymentStatus") ? { paymentStatus: sp.get("paymentStatus") as never } : {}),
    ...(sp.get("paymentMethod") ? { paymentProvider: sp.get("paymentMethod") ?? undefined } : {}),
    ...(sp.get("orderNumber") ? { orderNumber: { contains: sp.get("orderNumber") ?? "", mode: "insensitive" as const } } : {}),
    ...(sp.get("phone") ? { phone: { contains: sp.get("phone") ?? "", mode: "insensitive" as const } } : {}),
  }
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 2000, include: { items: true } })
  const rows = ["Order,Created,Email,Phone,Status,Payment,Fulfillment,Method,Items,Total"]
  for (const order of orders) rows.push([order.orderNumber, order.createdAt.toISOString(), order.email, order.phone, order.status, order.paymentStatus, order.fulfillmentStatus, order.paymentProvider, order.items.reduce((n, item) => n + item.quantity, 0), order.total].map(csv).join(","))
  return new NextResponse(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=khzr-orders.csv" } })
}
