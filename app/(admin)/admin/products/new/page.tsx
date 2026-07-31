import Link from "next/link"
import { AdminHeading } from "@/components/admin/admin-heading"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { getAdminCollections } from "@/lib/data-access/admin"

export const metadata = {
  title: "New Product",
}

export default async function AdminNewProductPage() {
  const collections = (await getAdminCollections()) ?? []

  return (
    <>
      <AdminHeading
        kicker="Catalogue"
        title="New Product"
        description="Draft a new piece for the maison."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/products">Back to products</Link>
          </Button>
        }
      />
      <ProductForm mode="create" collections={collections} />
    </>
  )
}
