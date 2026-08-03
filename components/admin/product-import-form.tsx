"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DownloadIcon, Loader2Icon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  importProductCsvAction,
  previewProductImportAction,
} from "@/lib/actions/admin-actions"
import type { ProductImportPreview, ProductImportResult } from "@/lib/product-import"

type ImportDisplayResult = ProductImportPreview | ProductImportResult

type ProductImportFormProps = {
  sampleCsv: string
}

function isImportReport(
  result: ImportDisplayResult
): result is ProductImportResult {
  return "imported" in result
}

export function ProductImportForm({ sampleCsv }: ProductImportFormProps) {
  const router = useRouter()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [busy, startTransition] = React.useTransition()
  const [result, setResult] = React.useState<ImportDisplayResult | null>(null)
  const [validRowsOnly, setValidRowsOnly] = React.useState(false)

  function formData() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error("Choose a CSV file first.")
      return null
    }
    const data = new FormData()
    data.set("file", file)
    return data
  }

  function preview() {
    const data = formData()
    if (!data) return
    startTransition(async () => {
      const response = await previewProductImportAction(data)
      if (response.ok) {
        setResult(response.result)
        toast.success("Import preview ready.")
      } else {
        setResult(null)
        toast.error(response.error)
      }
    })
  }

  function runImport(dryRun: boolean) {
    if (!result) {
      toast.error("Preview the CSV before importing.")
      return
    }
    const data = formData()
    if (!data) return
    data.set("dryRun", String(dryRun))
    data.set("validRowsOnly", String(validRowsOnly))
    startTransition(async () => {
      const response = await importProductCsvAction(data)
      if (response.ok) {
        setResult(response.result)
        toast.success(isImportReport(response.result) ? response.result.message : "Import preview ready.")
        if (isImportReport(response.result) && response.result.imported) router.refresh()
      } else {
        toast.error(response.error)
      }
    })
  }

  function downloadSample() {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = "khzr-product-import-template.csv"
    link.click()
    URL.revokeObjectURL(href)
  }

  const invalidRows = result && "invalidRows" in result ? result.invalidRows : 0
  const canImportAll = invalidRows === 0

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="flex flex-col gap-5 border border-hairline bg-card p-5">
        <div>
          <h2 className="font-display text-2xl font-light text-noir">Upload CSV</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            Preview every row before writing products. Images remain external URLs;
            Cloudinary uploads still happen through the existing image manager.
          </p>
        </div>

        <Input ref={fileRef} type="file" accept=".csv,text/csv" className="h-11 rounded-none border-hairline" onChange={() => setResult(null)} />

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={preview} disabled={busy}>
            {busy ? <Loader2Icon className="animate-spin" aria-hidden /> : <UploadIcon aria-hidden />}
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={() => runImport(true)} disabled={busy || !result}>
            Dry Run
          </Button>
          <Button type="button" onClick={() => runImport(false)} disabled={busy || !result || (!canImportAll && !validRowsOnly)}>
            Import Products
          </Button>
        </div>

        <label className="flex items-start gap-3 text-sm leading-relaxed text-stone">
          <Checkbox checked={validRowsOnly} onCheckedChange={(checked) => setValidRowsOnly(Boolean(checked))} />
          <span>
            Import valid rows only. Use this only after reviewing row-level errors;
            invalid rows will be skipped and reported.
          </span>
        </label>

        {result ? <ImportResult result={result} /> : null}
      </section>

      <aside className="flex flex-col gap-5 border border-hairline bg-ivory/60 p-5">
        <div>
          <h2 className="font-display text-2xl font-light text-noir">CSV Guide</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            Use one row per product. Required fields are product name, slug, price,
            status, color, collection, image URLs, and all S/M/L SKU and stock fields.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={downloadSample}>
          <DownloadIcon aria-hidden />
          Download Sample CSV
        </Button>
        <div className="space-y-3 text-sm leading-relaxed text-stone">
          <p>Collections must already exist. Accepted launch labels include New Arrivals, Ready to Wear, Printed Pret, Embroidered Pret, and Sale when those collections exist.</p>
          <p>Separate multiple collection labels and image URLs with <code className="bg-background px-1">|</code>.</p>
          <p>Launch merchandising columns include Fabric, Work type, Pieces included, Sleeve style, Neckline, Season, Size guide notes, and Care instructions.</p>
          <p>Variant columns are <code className="bg-background px-1">S SKU</code>, <code className="bg-background px-1">S Stock</code>, <code className="bg-background px-1">S Active</code>, repeated for M and L.</p>
          <p>Work type accepts Printed, Embroidered, or Digital Print. Active values accept yes/no, true/false, 1/0. Status must be DRAFT, ACTIVE, or ARCHIVED.</p>
        </div>
        <pre className="max-h-80 overflow-auto border border-hairline bg-background p-3 text-xs text-stone">
          {sampleCsv}
        </pre>
      </aside>
    </div>
  )
}

function ImportResult({ result }: { result: ImportDisplayResult }) {
  if (isImportReport(result) && result.imported) {
    return (
      <section className="border-t border-hairline pt-5">
        <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">Final Report</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Imported rows" value={result.importedRows} />
          <Metric label="Skipped rows" value={result.skippedRows} />
          <Metric label="Created" value={result.productsCreated} />
          <Metric label="Updated" value={result.productsUpdated} />
        </dl>
      </section>
    )
  }

  return (
    <section className="border-t border-hairline pt-5">
      <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
        {isImportReport(result) && result.dryRun ? "Dry Run Report" : "Import Preview"}
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total rows" value={result.totalRows} />
        <Metric label="Valid" value={result.validRows} />
        <Metric label="Invalid" value={result.invalidRows} />
        <Metric label="Create" value={result.productsToCreate} />
        <Metric label="Update" value={result.productsToUpdate} />
      </dl>
      {result.rows.length > 0 ? (
        <div className="mt-5 overflow-x-auto border border-hairline">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
              <tr>
                <th className="px-3 py-2 font-medium">Row</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Errors</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.row} className="border-t border-hairline">
                  <td className="px-3 py-2 text-taupe">{row.row}</td>
                  <td className="px-3 py-2 text-noir">{row.name || row.slug || "Untitled"}</td>
                  <td className="px-3 py-2 uppercase text-taupe">{row.action}</td>
                  <td className="px-3 py-2">{row.valid ? "Valid" : "Invalid"}</td>
                  <td className="px-3 py-2 text-stone">{row.errors.join(" ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-hairline bg-background px-4 py-3">
      <dt className="text-[0.625rem] uppercase tracking-[0.22em] text-taupe">{label}</dt>
      <dd className="mt-1 font-display text-2xl text-noir">{value}</dd>
    </div>
  )
}
