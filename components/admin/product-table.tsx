"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArchiveIcon,
  BoxesIcon,
  CopyIcon,
  Loader2Icon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn, formatMoney } from "@/lib/utils"
import type { AdminProductRow } from "@/lib/data-access/admin"
import {
  archiveProductAction,
  bulkPriceUpdateAction,
  bulkProductAction,
  deleteProductAction,
  duplicateProductAction,
  toggleFeatureAction,
} from "@/lib/actions/admin-actions"

type ProductTableProps = {
  products: AdminProductRow[]
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-noir text-warm-white",
  DRAFT: "bg-sand text-stone",
  ARCHIVED: "bg-muted text-taupe",
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter()
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<AdminProductRow | null>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [bulkPrice, setBulkPrice] = React.useState("")

  const allSelected = products.length > 0 && selected.length === products.length

  function toggleSelected(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  async function handleBulk(action: "feature" | "unfeature" | "archive" | "activate") {
    if (selected.length === 0) return
    if ((action === "archive" || action === "activate") && !window.confirm(`Apply ${action} to ${selected.length} product(s)?`)) return
    const result = await bulkProductAction({ productIds: selected, action })
    if (result.ok) {
      toast.success(result.message)
      setSelected([])
      router.refresh()
    } else toast.error(result.error)
  }

  async function handleBulkPrice() {
    if (selected.length === 0 || !bulkPrice.trim()) return
    if (!window.confirm(`Update price for ${selected.length} product(s)?`)) return
    const result = await bulkPriceUpdateAction({ productIds: selected, price: bulkPrice })
    if (result.ok) {
      toast.success(result.message)
      setBulkPrice("")
      setSelected([])
      router.refresh()
    } else toast.error(result.error)
  }

  async function handleFeature(p: AdminProductRow) {
    if (busyId) return
    setBusyId(p.id)
    const result = await toggleFeatureAction(p.id)
    setBusyId(null)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setBusyId(target.id)
    const result = await deleteProductAction(target.id)
    setBusyId(null)
    setPendingDelete(null)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleArchive(p: AdminProductRow) {
    if (busyId) return
    setBusyId(p.id)
    const result = await archiveProductAction(p.id)
    setBusyId(null)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDuplicate(p: AdminProductRow) {
    if (busyId) return
    setBusyId(p.id)
    const result = await duplicateProductAction(p.id)
    setBusyId(null)
    if (result.ok) {
      toast.success(result.message)
      if (result.slug) router.push(`/admin/products/${result.slug}`)
      else router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
        <BoxesIcon className="size-6 text-taupe" aria-hidden />
        <p className="font-display text-2xl font-light text-noir">
          No products match.
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-stone">
          Adjust the filters, or create a new piece to begin the catalogue.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto border border-hairline">
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-card p-3">
          <span className="text-xs uppercase tracking-[0.2em] text-taupe">{selected.length} selected</span>
          <Button type="button" variant="outline" size="sm" disabled={selected.length === 0} onClick={() => void handleBulk("feature")}>Bulk feature</Button>
          <Button type="button" variant="outline" size="sm" disabled={selected.length === 0} onClick={() => void handleBulk("unfeature")}>Bulk unfeature</Button>
          <Button type="button" variant="outline" size="sm" disabled={selected.length === 0} onClick={() => void handleBulk("activate")}>Bulk activate</Button>
          <Button type="button" variant="destructive" size="sm" disabled={selected.length === 0} onClick={() => void handleBulk("archive")}>Bulk archive</Button>
          <input value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} placeholder="New price" className="h-9 w-28 border border-hairline bg-background px-2 text-sm" />
          <Button type="button" variant="outline" size="sm" disabled={selected.length === 0 || !bulkPrice.trim()} onClick={() => void handleBulkPrice()}>Bulk price</Button>
        </div>
        <table className="w-full min-w-[860px] text-left text-sm" role="table">
          <caption className="sr-only">Products</caption>
          <thead>
            <tr className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
              <th scope="col" className="px-4 py-3 font-medium"><input type="checkbox" aria-label="Select all products" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])} /></th>
              <th scope="col" className="px-4 py-3 font-medium">Product</th>
              <th scope="col" className="px-4 py-3 font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Stock</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-center font-medium">Featured</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-hairline last:border-0 hover:bg-noir/[0.02]"
              >
                 <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)} /></td>
                 <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.slug}`}
                    className="flex items-center gap-3"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden border border-hairline bg-ivory">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="size-full object-cover"
                          width={44}
                          height={44}
                        />
                      ) : (
                        <BoxesIcon className="size-4 text-taupe" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[260px] truncate font-medium text-noir">
                        {p.name}
                      </span>
                      <span className="block text-xs text-taupe">
                        {p.sku ?? p.slug}
                        {p.collectionNames.length > 0
                          ? ` · ${p.collectionNames.join(", ")}`
                          : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-noir">
                  {formatMoney(p.price)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-noir">{p.totalStock}</span>
                  <span className="text-xs text-taupe">
                    {" "}
                    / {p.variantCount} variants
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center border px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.18em]",
                      STATUS_STYLES[p.status] ?? "bg-muted text-taupe"
                    )}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    aria-pressed={p.isFeatured}
                    aria-label={
                      p.isFeatured
                        ? `Remove ${p.name} from featured`
                        : `Feature ${p.name}`
                    }
                    disabled={busyId === p.id}
                    onClick={() => handleFeature(p)}
                    className="inline-flex size-9 items-center justify-center transition-colors duration-300 ease-lux hover:bg-noir/[0.05] disabled:opacity-50"
                  >
                    {busyId === p.id ? (
                      <Loader2Icon className="size-4 animate-spin text-taupe" aria-hidden />
                    ) : (
                      <StarIcon
                        className={cn(
                          "size-4 transition-colors",
                          p.isFeatured
                            ? "fill-champagne text-champagne"
                            : "text-taupe/60"
                        )}
                        aria-hidden
                      />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        href={`/admin/products/${p.slug}`}
                        aria-label={`Edit ${p.name}`}
                      >
                        <PencilIcon aria-hidden />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Duplicate ${p.name}`}
                      disabled={busyId === p.id}
                      onClick={() => handleDuplicate(p)}
                    >
                      {busyId === p.id ? (
                        <Loader2Icon className="animate-spin" aria-hidden />
                      ) : (
                        <CopyIcon aria-hidden />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Archive ${p.name}`}
                      disabled={busyId === p.id || p.status === "ARCHIVED"}
                      onClick={() => handleArchive(p)}
                    >
                      <ArchiveIcon aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => setPendingDelete(p)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon aria-hidden />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}</DialogTitle>
            <DialogDescription>
              This permanently removes the product, its variants, images and
              collection links. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busyId === pendingDelete?.id}
              onClick={handleDelete}
            >
              {busyId === pendingDelete?.id ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
              ) : (
                <TrashIcon aria-hidden />
              )}
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
