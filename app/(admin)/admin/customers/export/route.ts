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
  const allowed = await rateLimit("admin:customers-export", 10, 60 * 60 * 1000)
  if (!allowed) return new NextResponse("Too many exports.", { status: 429 })
  const newsletter = request.nextUrl.searchParams.get("newsletter")
  const customers = await prisma.user.findMany({
    where: newsletter ? { newsletter: newsletter === "true" } : {},
    include: { _count: { select: { orders: true, addresses: true } }, orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  })
  const rows = ["Name,Email,Phone,Newsletter,Orders,Addresses,Total Spend,Joined"]
  for (const c of customers) rows.push([[c.firstName, c.lastName].filter(Boolean).join(" "), c.email, c.phone, c.newsletter, c._count.orders, c._count.addresses, c.orders.reduce((sum, order) => sum + Number(order.total), 0), c.createdAt.toISOString()].map(csv).join(","))
  return new NextResponse(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=khzr-customers.csv" } })
}
