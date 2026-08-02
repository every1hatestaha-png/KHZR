import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { PromotionForm } from "@/components/admin/promotion-form"
import { Button } from "@/components/ui/button"
import { getAdminPromotion } from "@/lib/data-access/promotions"

export const metadata = { title: "Edit Promotion" }
export const dynamic = "force-dynamic"

export default async function AdminPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const promotion = await getAdminPromotion(id)
  if (!promotion) return <AdminHeading kicker="Commerce" title="Promotion not found" />
  return (
    <>
      <AdminHeading kicker="Commerce" title={promotion.name} description={`${promotion.usageCount} use${promotion.usageCount === 1 ? "" : "s"}`} actions={<Button asChild variant="outline"><Link href="/admin/promotions"><ArrowLeftIcon />All promotions</Link></Button>} />
      <PromotionForm promotion={promotion} />
    </>
  )
}
