"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BoxesIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { AdminInventoryRow } from "@/lib/data-access/admin"
import { updateInventoryAction } from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

export function InventoryTable({
  products,
}: {
  products: AdminInventoryRow[]
}) {
  const router = useRouter()
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [active, setActive] = React.useState<Record<string, boolean>>({})
  const [saving, setSaving] = React.useState<string | null>(null)

  const productCount = products.length

  function setStock(variantId: string, stock: string) {
    setValues((prev) => ({ ...prev, [variantId]: stock }))
  }

  function setActiveState(variantId: string, isActive: boolean) {
    setActive((prev) => ({ ...prev, [variantId]: isActive }))
  }

  function isDirty(product: AdminInventoryRow): boolean {
    return product.variants.some((v) => {
      const next = values[v.id]
      const nextActive = active[v.id]
      if (next !== undefined && next !== String(v.stock)) return true
      if (nextActive !== undefined && nextActive !== v.active) return true
      return false
    })
  }

  async function saveProduct(product: AdminInventoryRow) {
    setSaving(product.id)
    const items = product.variants.map((v) => ({
      variantId: v.id,
      stock: values[v.id] ?? String(v.stock),
      active: active[v.id] ?? v.active,
    }))
    const result = await updateInventoryAction({ items })
    setSaving(null)
    if (result.ok) {
      toast.success(`${product.name} inventory saved.`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function lowStock(variant: AdminInventoryRow["variants"][number]): boolean {
    const stock = values[variant.id] !== undefined ? Number(values[variant.id]) : variant.stock
    return stock <= variant.lowStockAt
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-[0.22em] text-taupe">
        {productCount} product{productCount === 1 ? "" : "s"} · edit stock by
        size and colour, then save per product
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <BoxesIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">
            Nothing to count yet.
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-stone">
            Products appear here once they are added to the catalogue.
          </p>
        </div>
      ) : null}

      {products.map((product) => (
        <section
          key={product.id}
          className="flex flex-col border border-hairline bg-card"
        >
          <header className="flex flex-col gap-3 border-b border-hairline bg-ivory/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden border border-hairline bg-background">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <BoxesIcon className="size-4 text-taupe" aria-hidden />
                )}
              </span>
              <div>
                <h3 className="font-display text-xl font-light text-noir">
                  {product.name}
                </h3>
                <p className="text-xs text-taupe">
                  {product.sku ?? product.slug} ·{" "}
                  <span
                    className={cn(
                      product.totalStock === 0 && "font-medium text-destructive"
                    )}
                  >
                    {product.totalStock} units
                  </span>{" "}
                  across {product.variantCount} variants
                </p>
              </div>
            </div>
            <Button
              className="h-10 rounded-none"
              disabled={saving !== null || !isDirty(product)}
              onClick={() => void saveProduct(product)}
            >
              {saving === product.id ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              {saving === product.id ? "Saving…" : "Save"}
            </Button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm" role="table">
              <caption className="sr-only">
                Stock by size and colour for {product.name}
              </caption>
              <thead>
                <tr className="border-b border-hairline text-[0.625rem] uppercase tracking-[0.22em] text-taupe">
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Size</th>
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Colour</th>
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">SKU</th>
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Low at</th>
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Stock</th>
                  <th scope="col" className="px-4 py-2.5 text-center font-medium sm:px-5">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => {
                  return (
                    <tr
                      key={variant.id}
                      className={cn(
                        "border-b border-hairline last:border-0",
                        !variant.active && "opacity-45"
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-noir sm:px-5">
                        {variant.size}
                      </td>
                      <td className="px-4 py-2.5 sm:px-5">
                        <span className="flex items-center gap-2 text-noir">
                          <span
                            className="size-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: variant.colorHex ?? "#c2a878" }}
                            aria-hidden
                          />
                          {variant.color}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-taupe sm:px-5">
                        {variant.sku}
                      </td>
                      <td className="px-4 py-2.5 text-taupe sm:px-5">
                        {variant.lowStockAt}
                      </td>
                      <td className="px-4 py-2 sm:px-5">
                        <Input
                          value={values[variant.id] ?? String(variant.stock)}
                          onChange={(e) => setStock(variant.id, e.target.value)}
                          inputMode="numeric"
                          aria-label={`${variant.color} ${variant.size} stock`}
                          className={cn(
                            "h-8 w-20 rounded-none border-hairline",
                            lowStock(variant) && "border-champagne"
                          )}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center sm:px-5">
                        <Checkbox
                          checked={active[variant.id] ?? variant.active}
                          onCheckedChange={(v) =>
                            setActiveState(variant.id, Boolean(v))
                          }
                          aria-label={`${variant.color} ${variant.size} active`}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
