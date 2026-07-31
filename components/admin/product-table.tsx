"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BoxesIcon,
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
import { deleteProductAction, toggleFeatureAction } from "@/lib/actions/admin-actions"

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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
        <BoxesIcon className="size-6 text-taupe" />
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
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-ivory/60 text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-hairline last:border-0 hover:bg-noir/[0.02]"
              >
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
                        <BoxesIcon className="size-4 text-taupe" />
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
                      <Loader2Icon className="size-4 animate-spin text-taupe" />
                    ) : (
                      <StarIcon
                        className={cn(
                          "size-4 transition-colors",
                          p.isFeatured
                            ? "fill-champagne text-champagne"
                            : "text-taupe/60"
                        )}
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
                        <PencilIcon />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => setPendingDelete(p)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon />
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
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <TrashIcon />
              )}
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
