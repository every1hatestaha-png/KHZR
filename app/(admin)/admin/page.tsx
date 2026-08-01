import Link from "next/link"
import {
  ArrowUpRightIcon,
  BoxesIcon,
  FolderIcon,
  LayersIcon,
  PackageIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { Button } from "@/components/ui/button"
import { getAdminSummary } from "@/lib/data-access/admin"
import { formatDate, formatMoney } from "@/lib/utils"

export const metadata = {
  title: "Overview",
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-2 border border-hairline bg-card p-5">
      <span className="text-[0.625rem] font-medium uppercase tracking-[0.28em] text-taupe">
        {label}
      </span>
      <span className="font-display text-4xl font-light text-noir">{value}</span>
      {hint ? <span className="text-xs text-stone">{hint}</span> : null}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const summary = await getAdminSummary()

  if (!summary) {
    return (
      <>
        <AdminHeading
          kicker="The Studio"
          title="Overview"
          description="Catalogue, orders, campaigns and content management."
        />
        <section className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <TriangleAlertIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">
            The database is not reachable.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-stone">
            Ensure DATABASE_URL is set and the Neon database is migrated, then
            try again. The storefront continues to serve its editorial catalogue.
          </p>
        </section>
      </>
    )
  }

  return (
    <>
      <AdminHeading
        kicker="The Studio"
        title="Overview"
        description="Catalogue, orders, campaigns and content management."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/products/new">
              <PackageIcon />
              New Product
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Products" value={summary.products} />
        <StatCard label="Active" value={summary.activeProducts} />
        <StatCard label="Featured" value={summary.featured} />
        <StatCard label="Collections" value={summary.collections} />
        <StatCard label="Variants" value={summary.variants} />
        <StatCard
          label="Units in stock"
          value={summary.totalStock}
          hint={`${summary.lowStockCount} low · ${summary.outOfStockCount} out`}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-light text-noir">
            Recently added
          </h2>
          <Button asChild variant="luxury-link">
            <Link href="/admin/products">
              All products
              <ArrowUpRightIcon />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[720px] text-left text-sm" role="table">
            <caption className="sr-only">Recently added products</caption>
            <thead>
              <tr className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                <th scope="col" className="px-4 py-3 font-medium">Product</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-hairline last:border-0 hover:bg-noir/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.slug}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border border-hairline bg-ivory">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="size-full object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <BoxesIcon className="size-4 text-taupe" aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-noir">
                          {p.name}
                        </span>
                        <span className="block text-xs text-taupe">
                          {p.sku ?? p.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-noir">
                    {formatMoney(p.price)}
                  </td>
                  <td className="px-4 py-3 text-noir">{p.totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "ACTIVE"
                          ? "text-stone"
                          : p.status === "DRAFT"
                            ? "text-taupe"
                            : "text-destructive"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-taupe">
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              ))}
              {summary.recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-taupe">
                    No products yet — create your first piece.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="group flex flex-col gap-3 border border-hairline bg-card p-5 transition-colors hover:border-stone"
        >
          <PackageIcon className="size-5 text-taupe transition-colors group-hover:text-noir" />
          <span className="font-display text-xl font-light text-noir">
            Products
          </span>
          <span className="text-xs leading-relaxed text-stone">
            Create, edit, feature and retire pieces in the catalogue.
          </span>
        </Link>
        <Link
          href="/admin/categories"
          className="group flex flex-col gap-3 border border-hairline bg-card p-5 transition-colors hover:border-stone"
        >
          <FolderIcon className="size-5 text-taupe transition-colors group-hover:text-noir" />
          <span className="font-display text-xl font-light text-noir">
            Categories
          </span>
          <span className="text-xs leading-relaxed text-stone">
            The rooms of the maison — tailoring, essentials, evening, archive.
          </span>
        </Link>
        <Link
          href="/admin/inventory"
          className="group flex flex-col gap-3 border border-hairline bg-card p-5 transition-colors hover:border-stone"
        >
          <LayersIcon className="size-5 text-taupe transition-colors group-hover:text-noir" />
          <span className="font-display text-xl font-light text-noir">
            Inventory
          </span>
          <span className="text-xs leading-relaxed text-stone">
            Size-and-colour stock, low-stock thresholds and activation.
          </span>
        </Link>
      </section>

      <p className="flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
        <SparklesIcon className="size-3.5" aria-hidden />
        The storefront renders live from this catalogue.
      </p>
    </>
  )
}
