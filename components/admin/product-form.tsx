"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ImageManager,
  type ManagedImage,
} from "@/components/admin/image-manager"
import type {
  AdminCollectionDTO,
  AdminProductDetail,
} from "@/lib/data-access/admin"
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/admin-actions"
import { slugify } from "@/lib/utils"

type VariantDraft = {
  id?: string
  size: string
  color: string
  colorHex: string
  sku: string
  priceOverride: string
  stock: string
  lowStockAt: string
  active: boolean
}

const SIZES = ["XS", "S", "M", "L", "XL", "35", "36", "37", "38", "39", "40"]

const COLORWAYS: Record<string, string> = {
  Noir: "#121110",
  Oat: "#d9cebd",
  Ivory: "#f3eee6",
  Champagne: "#c2a878",
  Sand: "#e4dccd",
  Stone: "#5c5248",
}

function emptyVariant(): VariantDraft {
  return {
    size: "M",
    color: "Noir",
    colorHex: COLORWAYS.Noir,
    sku: "",
    priceOverride: "",
    stock: "0",
    lowStockAt: "5",
    active: true,
  }
}

type ProductFormProps = {
  mode: "create" | "edit"
  initial?: AdminProductDetail
  collections: AdminCollectionDTO[]
}

export function ProductForm({ mode, initial, collections }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)

  const [name, setName] = React.useState(initial?.name ?? "")
  const [slug, setSlug] = React.useState(initial?.slug ?? "")
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initial?.slug))
  const [subtitle, setSubtitle] = React.useState(initial?.subtitle ?? "")
  const [description, setDescription] = React.useState(initial?.description ?? "")
  const [composition, setComposition] = React.useState(initial?.composition ?? "")
  const [care, setCare] = React.useState(initial?.care ?? "")
  const [price, setPrice] = React.useState(initial ? String(initial.price) : "")
  const [compareAtPrice, setCompareAtPrice] = React.useState(
    initial?.compareAtPrice != null ? String(initial.compareAtPrice) : ""
  )
  const [currency, setCurrency] = React.useState<string>(initial?.currency ?? "PKR")
  const [status, setStatus] = React.useState<string>(initial?.status ?? "DRAFT")
  const [stockStatus, setStockStatus] = React.useState<string>(initial?.stockStatus ?? "IN_STOCK")
  const [sku, setSku] = React.useState(initial?.sku ?? "")
  const [sortOrder, setSortOrder] = React.useState(
    initial ? String(initial.sortOrder) : "0"
  )
  const [isNew, setIsNew] = React.useState(initial?.isNew ?? false)
  const [isFeatured, setIsFeatured] = React.useState(initial?.isFeatured ?? false)
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "")
  const [collectionIds, setCollectionIds] = React.useState<string[]>(
    initial?.collectionIds ?? []
  )
  const [variants, setVariants] = React.useState<VariantDraft[]>(() =>
    initial && initial.variants.length > 0
      ? initial.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? COLORWAYS[v.color] ?? "#c2a878",
          sku: v.sku,
          priceOverride: v.priceOverride != null ? String(v.priceOverride) : "",
          stock: String(v.stock),
          lowStockAt: String(v.lowStockAt),
          active: v.active,
        }))
      : [emptyVariant()]
  )
  const [images, setImages] = React.useState<ManagedImage[]>(
    initial?.media.map((m) => ({ url: m.url, alt: m.alt })) ?? []
  )

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    )
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function toggleCollection(id: string) {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    const payload = {
      id: initial?.id,
      name,
      slug,
      subtitle,
      description,
      composition,
      care,
      price,
      compareAtPrice,
      currency,
      status,
      stockStatus,
      sku,
      isNew,
      isFeatured,
      sortOrder,
      seoTitle,
      seoDescription,
      collectionIds,
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku: v.sku,
        priceOverride: v.priceOverride,
        stock: v.stock,
        lowStockAt: v.lowStockAt,
        active: v.active,
      })),
      images,
    }

    const result =
      mode === "edit"
        ? await updateProductAction(payload)
        : await createProductAction(payload)

    setSaving(false)
    if (result.ok) {
      toast.success(result.message ?? "Saved.")
      if (mode === "create" && result.productId) {
        router.push(`/admin/products/${slug}`)
      } else {
        router.refresh()
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* ── Essentials ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-light text-noir">Essentials</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="The Slate Wool Overcoat"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Slug" required>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="slate-wool-overcoat"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Subtitle">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Fulling-needle wool, cut long and clean"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="SKU">
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="KHZR-COAT-SLATE"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Description" full>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="The story of the piece…"
              className="rounded-none border-hairline"
            />
          </Field>
          <Field label="Composition">
            <Input
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="100% virgin wool · horn buttons"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Care">
            <Input
              value={care}
              onChange={(e) => setCare(e.target.value)}
              placeholder="Dry clean only."
              className="h-10 rounded-none border-hairline"
            />
          </Field>
        </div>
      </section>

      {/* ── Pricing & placement ────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-light text-noir">
          Pricing &amp; placement
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Price" required>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="1850.00"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Compare-at price">
            <Input
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Currency">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-10 w-full rounded-none border-hairline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">PKR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Sort order">
            <Input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-full rounded-none border-hairline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Stock status">
            <Select value={stockStatus} onValueChange={setStockStatus}>
              <SelectTrigger className="h-10 w-full rounded-none border-hairline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">In stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
                <SelectItem value="PRE_ORDER">Pre-order</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-noir">
            <Checkbox checked={isNew} onCheckedChange={(v) => setIsNew(Boolean(v))} />
            New arrival
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-noir">
            <Checkbox
              checked={isFeatured}
              onCheckedChange={(v) => setIsFeatured(Boolean(v))}
            />
            Featured on the homepage
          </label>
        </div>
      </section>

      {/* ── Collections ────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-light text-noir">Collections</h2>
        {collections.length === 0 ? (
          <p className="text-sm text-taupe">
            No collections exist yet — add one under Categories first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={collectionIds.includes(c.id)}
                onClick={() => toggleCollection(c.id)}
                className={
                  collectionIds.includes(c.id)
                    ? "border border-noir bg-noir px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-warm-white"
                    : "border border-hairline bg-card px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-noir hover:border-stone"
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Images ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-light text-noir">Images</h2>
        <ImageManager value={images} onChange={setImages} disabled={saving} />
      </section>

      {/* ── Variants ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-light text-noir">Variants</h2>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-none"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
          >
            <PlusIcon />
            Add variant
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="grid gap-3 border border-hairline bg-card p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Field label="Size">
                <Select
                  value={variant.size}
                  onValueChange={(v) => updateVariant(index, { size: v })}
                >
                  <SelectTrigger className="h-9 w-full rounded-none border-hairline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Colour">
                <Select
                  value={variant.color}
                  onValueChange={(v) =>
                    updateVariant(index, {
                      color: v,
                      colorHex: COLORWAYS[v] ?? variant.colorHex,
                    })
                  }
                >
                  <SelectTrigger className="h-9 w-full rounded-none border-hairline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COLORWAYS).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Hex">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(variant.colorHex) ? variant.colorHex : "#c2a878"}
                    onChange={(e) => updateVariant(index, { colorHex: e.target.value })}
                    className="h-9 w-10 cursor-pointer border border-hairline bg-transparent"
                    aria-label="Colour hex picker"
                  />
                  <Input
                    value={variant.colorHex}
                    onChange={(e) => updateVariant(index, { colorHex: e.target.value })}
                    placeholder="#121110"
                    className="h-9 flex-1 rounded-none border-hairline"
                  />
                </div>
              </Field>
              <Field label="Variant SKU">
                <Input
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                  placeholder={`${sku || "KHZR"}-NOIR-M`}
                  className="h-9 rounded-none border-hairline"
                />
              </Field>
              <Field label="Stock">
                <Input
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, { stock: e.target.value })}
                  inputMode="numeric"
                  className="h-9 rounded-none border-hairline"
                />
              </Field>
              <Field label="Low-stock at">
                <Input
                  value={variant.lowStockAt}
                  onChange={(e) => updateVariant(index, { lowStockAt: e.target.value })}
                  inputMode="numeric"
                  className="h-9 rounded-none border-hairline"
                />
              </Field>
              <Field label="Price override">
                <Input
                  value={variant.priceOverride}
                  onChange={(e) => updateVariant(index, { priceOverride: e.target.value })}
                  inputMode="decimal"
                  placeholder="None"
                  className="h-9 rounded-none border-hairline"
                />
              </Field>
              <div className="flex items-end justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2.5 pb-2.5 text-sm text-noir">
                  <Checkbox
                    checked={variant.active}
                    onCheckedChange={(v) => updateVariant(index, { active: Boolean(v) })}
                  />
                  Active
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove variant"
                  onClick={() =>
                    setVariants((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-light text-noir">Search</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title">
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`${name || "Product"} — KHZR`}
              className="h-10 rounded-none border-hairline"
            />
          </Field>
          <Field label="SEO description">
            <Input
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="A short, searchable summary…"
              className="h-10 rounded-none border-hairline"
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-hairline pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-none"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Loader2Icon className="size-4 animate-spin" /> : null}
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string
  required?: boolean
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label className="mb-1.5 text-[0.625rem] font-medium uppercase tracking-[0.24em] text-taupe">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  )
}
