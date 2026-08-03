import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { ProductImportForm } from "@/components/admin/product-import-form"
import { Button } from "@/components/ui/button"
import { productImportSampleCsv } from "@/lib/product-import"

export const metadata = {
  title: "Import Products",
}

export default function AdminProductImportPage() {
  return (
    <>
      <AdminHeading
        kicker="Catalogue"
        title="Bulk Product Import"
        description="Preview and import ready-to-wear launch products from a CSV file."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/products">
              <ArrowLeftIcon />
              Products
            </Link>
          </Button>
        }
      />
      <ProductImportForm sampleCsv={productImportSampleCsv()} />
    </>
  )
}
