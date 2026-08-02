import "server-only"

import { prisma } from "@/lib/prisma"

export async function listAdminPromotions() {
  return prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    include: { products: { include: { product: true } }, collections: { include: { collection: true } } },
  })
}

export async function getAdminPromotion(id: string) {
  return prisma.promotion.findUnique({
    where: { id },
    include: { products: { include: { product: true } }, collections: { include: { collection: true } } },
  })
}

export async function promotionStats() {
  const [active, inactive, totalUses] = await Promise.all([
    prisma.promotion.count({ where: { active: true } }),
    prisma.promotion.count({ where: { active: false } }),
    prisma.promotion.aggregate({ _sum: { usageCount: true } }),
  ])
  return { active, inactive, totalUses: totalUses._sum.usageCount ?? 0 }
}
