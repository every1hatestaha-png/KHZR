import Link from "next/link"
import { PackageIcon, TriangleAlertIcon, UploadIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { Pagination } from "@/components/admin/pagination"
import { ProductFilters } from "@/components/admin/product-filters"
import { ProductTable } from "@/components/admin/product-table"
import { Button } from "@/components/ui/button"
import {
  getAdminCollections,
  getAdminProducts,
  type AdminStatus,
} from "@/lib/data-access/admin"
import { productListParamsSchema } from "@/lib/validations/admin"

export const metadata = {
  title: "Products",
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = await searchParams
  const params = productListParamsSchema.safeParse(raw)
  const parsed = params.success
    ? params.data
    : { q: undefined, status: undefined, collection: undefined, featured: undefined, page: 1, perPage: 12 }

  const [list, collections] = await Promise.all([
    getAdminProducts({
      q: parsed.q,
      status: parsed.status as AdminStatus | undefined,
      collection: parsed.collection,
      featured: parsed.featured,
      page: parsed.page,
      perPage: parsed.perPage,
    }),
    getAdminCollections(),
  ])

  return (
    <>
      <AdminHeading
        kicker="Catalogue"
        title="Products"
        description="Create, edit, feature and retire every piece in the maison."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/products/import">
                <UploadIcon />
                Import CSV
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <PackageIcon />
                New Product
              </Link>
            </Button>
          </div>
        }
      />

      <ProductFilters
        collections={collections ?? []}
        query={parsed.q ?? ""}
        status={parsed.status ?? ""}
        collection={parsed.collection ?? ""}
        featured={parsed.featured ?? ""}
      />

      {!list ? (
        <section className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <TriangleAlertIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">
            The catalogue is not reachable.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-stone">
            The database could not be reached. Confirm DATABASE_URL is set and
            the Neon instance is migrated.
          </p>
        </section>
      ) : (
        <>
          <ProductTable products={list.items} />
          <p className="text-center text-xs uppercase tracking-[0.22em] text-taupe">
            {list.total} product{list.total === 1 ? "" : "s"}
          </p>
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            basePath="/admin/products"
            params={{
              q: parsed.q,
              status: parsed.status,
              collection: parsed.collection,
              featured: parsed.featured,
            }}
          />
        </>
      )}
    </>
  )
}
