import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminHeading } from "@/components/admin/admin-heading"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import {
  getAdminCollections,
  getAdminProductBySlug,
} from "@/lib/data-access/admin"

export const metadata = {
  title: "Edit Product",
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, collections] = await Promise.all([
    getAdminProductBySlug(slug),
    getAdminCollections(),
  ])

  if (!product) notFound()

  return (
    <>
      <AdminHeading
        kicker="Catalogue"
        title={product.name}
        description={`Editing ${product.sku ?? product.slug}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/products">Back to products</Link>
          </Button>
        }
      />
      <ProductForm mode="edit" initial={product} collections={collections ?? []} />
    </>
  )
}
