import "server-only"

import { prisma } from "@/lib/prisma"
import { roundMoney } from "@/lib/services/pricing-service"
import { quoteShippingFromZones, type ShippingQuote } from "@/lib/shipping-rules"

export async function listShippingZones() {
  return prisma.shippingZone.findMany({ orderBy: [{ province: "asc" }, { cityMatch: "desc" }] })
}

export async function quoteShipping({
  province,
  city,
  subtotal,
}: {
  province: string
  city: string
  subtotal: number
}): Promise<ShippingQuote> {
  const zones = await prisma.shippingZone.findMany({ where: { active: true } })
  return quoteShippingFromZones(zones, { province, city, subtotal })
}

export async function updateShippingZone(input: {
  id: string
  amount: number
  freeShippingThreshold: number
  active: boolean
}) {
  if (input.amount < 0 || input.freeShippingThreshold < 0) {
    throw new Error("Shipping values cannot be negative.")
  }
  return prisma.shippingZone.update({
    where: { id: input.id },
    data: {
      amount: roundMoney(input.amount),
      freeShippingThreshold: roundMoney(input.freeShippingThreshold),
      active: input.active,
    },
  })
}
