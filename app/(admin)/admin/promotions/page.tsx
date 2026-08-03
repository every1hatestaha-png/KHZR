import Link from "next/link"
import { CopyIcon, PlusIcon, ToggleLeftIcon, TrashIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { PromotionForm } from "@/components/admin/promotion-form"
import { Button } from "@/components/ui/button"
import { deletePromotionAction, disablePromotionAction, duplicatePromotionAction } from "@/lib/actions/promotion-actions"
import { listAdminPromotions, promotionStats } from "@/lib/data-access/promotions"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = { title: "Promotions" }
export const dynamic = "force-dynamic"

export default async function AdminPromotionsPage() {
  const [promotions, stats] = await Promise.all([listAdminPromotions(), promotionStats()])
  return (
    <>
      <AdminHeading kicker="Commerce" title="Promotions" description={`${stats.active} active · ${stats.inactive} inactive · ${stats.totalUses} total uses`} />
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto border border-hairline bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
              <tr><th className="px-4 py-3">Promotion</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Window</th><th className="px-4 py-3">Uses</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3"><Link href={`/admin/promotions/${promotion.id}`} className="font-medium text-noir hover:underline">{promotion.name}</Link><p className="text-xs text-taupe">{promotion.code ?? "Automatic"} · {promotion.active ? "Active" : "Inactive"}</p></td>
                  <td className="px-4 py-3 text-stone">{promotion.trigger} · {promotion.scope}</td>
                  <td className="px-4 py-3 text-stone">{promotion.discountType === "PERCENTAGE" ? `${promotion.percentage}%` : promotion.discountType === "FIXED_AMOUNT" ? formatMoney(Number(promotion.amount), "PKR") : "Free shipping"}</td>
                  <td className="px-4 py-3 text-stone">{promotion.startsAt ? formatDate(promotion.startsAt.toISOString()) : "Now"} - {promotion.endsAt ? formatDate(promotion.endsAt.toISOString()) : "Open"}</td>
                  <td className="px-4 py-3 text-stone">{promotion.usageCount}{promotion.maxUses ? ` / ${promotion.maxUses}` : ""}</td>
                  <td className="px-4 py-3"><div className="flex gap-2"><ActionButton id={promotion.id} action="duplicate" /><ActionButton id={promotion.id} action="disable" /><ActionButton id={promotion.id} action="delete" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center gap-2"><PlusIcon className="size-4 text-taupe" /><h2 className="font-display text-2xl text-noir">Create promotion</h2></div>
          <PromotionForm />
        </div>
      </section>
    </>
  )
}

function ActionButton({ id, action }: { id: string; action: "duplicate" | "disable" | "delete" }) {
  const fn = action === "duplicate" ? duplicatePromotionAction : action === "disable" ? disablePromotionAction : deletePromotionAction
  const Icon = action === "duplicate" ? CopyIcon : action === "disable" ? ToggleLeftIcon : TrashIcon
  return (
    <form action={async () => { "use server"; await fn({ id }) }}>
      <Button type="submit" variant={action === "delete" ? "destructive" : "outline"} size="sm"><Icon />{action === "duplicate" ? "Duplicate" : action === "disable" ? "Disable" : "Delete"}</Button>
    </form>
  )
}
