import { TriangleAlertIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { InventoryTable } from "@/components/admin/inventory-table"
import { getAdminInventory } from "@/lib/data-access/admin"

export const metadata = {
  title: "Inventory",
}

export default async function AdminInventoryPage() {
  const inventory = await getAdminInventory()

  return (
    <>
      <AdminHeading
        kicker="Stockroom"
        title="Inventory"
        description="Size-and-colour stock, low-stock thresholds and activation."
      />

      {!inventory ? (
        <section className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <TriangleAlertIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">
            The stockroom is not reachable.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-stone">
            Confirm DATABASE_URL is set and the Neon instance is migrated.
          </p>
        </section>
      ) : (
        <InventoryTable products={inventory} />
      )}
    </>
  )
}
