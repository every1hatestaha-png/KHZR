import { TriangleAlertIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { CategoryManager } from "@/components/admin/category-manager"
import { getAdminCollections } from "@/lib/data-access/admin"

export const metadata = {
  title: "Categories",
}

export default async function AdminCategoriesPage() {
  const collections = await getAdminCollections()

  return (
    <>
      <AdminHeading
        kicker="Catalogue"
        title="Categories"
        description="The rooms of the maison — create, rename and retire collections."
      />

      {!collections ? (
        <section className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <TriangleAlertIcon className="size-6 text-taupe" />
          <p className="font-display text-2xl font-light text-noir">
            The database is not reachable.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-stone">
            Confirm DATABASE_URL is set and the Neon instance is migrated.
          </p>
        </section>
      ) : (
        <CategoryManager categories={collections} />
      )}
    </>
  )
}
