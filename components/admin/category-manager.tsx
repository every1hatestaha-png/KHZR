"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  FolderIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdminCollectionDTO } from "@/lib/data-access/admin"
import {
  createCollectionAction,
  deleteCollectionAction,
  toggleCollectionPublishedAction,
  updateCollectionAction,
} from "@/lib/actions/admin-actions"
import { slugify } from "@/lib/utils"

type Draft = {
  id?: string
  name: string
  slug: string
  description: string
  editorial: string
  imageUrl: string
  isFeatured: boolean
  sortOrder: string
  seoTitle: string
  seoDescription: string
}

function emptyDraft(): Draft {
  return {
    name: "",
    slug: "",
    description: "",
    editorial: "",
    imageUrl: "",
    isFeatured: false,
    sortOrder: "0",
    seoTitle: "",
    seoDescription: "",
  }
}

function toDraft(c: AdminCollectionDTO): Draft {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    editorial: "",
    imageUrl: c.imageUrl ?? "",
    isFeatured: c.isFeatured,
    sortOrder: String(c.sortOrder),
    seoTitle: "",
    seoDescription: "",
  }
}

export function CategoryManager({
  categories,
}: {
  categories: AdminCollectionDTO[]
}) {
  const router = useRouter()
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<AdminCollectionDTO | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  function openNew() {
    setDraft(emptyDraft())
    setSlugTouched(false)
  }

  function openEdit(c: AdminCollectionDTO) {
    setDraft(toDraft(c))
    setSlugTouched(true)
  }

  function patch(p: Partial<Draft>) {
    setDraft((prev) => (prev ? { ...prev, ...p } : prev))
  }

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    const result = draft.id
      ? await updateCollectionAction(draft)
      : await createCollectionAction(draft)
    setSaving(false)
    if (result.ok) {
      toast.success(result.message)
      setDraft(null)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setBusyId(target.id)
    const result = await deleteCollectionAction(target.id)
    setBusyId(null)
    setPendingDelete(null)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handlePublish(c: AdminCollectionDTO) {
    setBusyId(c.id)
    const result = await toggleCollectionPublishedAction(c.id)
    setBusyId(null)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else toast.error(result.error)
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-hairline pb-5">
        <div>
          <h2 className="font-display text-2xl font-light text-noir">
            {categories.length} collection{categories.length === 1 ? "" : "s"}
          </h2>
          <p className="text-sm text-stone">
            The rooms of the maison. Products are grouped here and surfaced on
            the collections pages.
          </p>
        </div>
        <Button className="rounded-none" onClick={openNew}>
          <PlusIcon />
          New category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-hairline bg-card px-6 py-20 text-center">
          <FolderIcon className="size-6 text-taupe" aria-hidden />
          <p className="font-display text-2xl font-light text-noir">
            No categories yet.
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-stone">
            Create the first launch collection — New Arrivals, Ready to Wear,
            Printed Pret, Embroidered Pret, or Sale — to begin organising the catalogue.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-4 border border-hairline bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden border border-hairline bg-ivory">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="size-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <FolderIcon className="size-5 text-taupe" aria-hidden />
                    )}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-light text-noir">
                      {c.name}
                    </h3>
                    <p className="text-xs text-taupe">
                      /collection/{c.slug}
                    </p>
                  </div>
                </div>
                {c.isFeatured ? (
                  <StarIcon className="size-4 shrink-0 fill-champagne text-champagne" aria-hidden />
                ) : null}
              </div>

              {c.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-stone">
                  {c.description}
                </p>
              ) : null}

              <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3">
                <span className="text-xs uppercase tracking-[0.18em] text-taupe">
                  {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={c.publishedAt ? `Hide ${c.name}` : `Publish ${c.name}`}
                    disabled={busyId === c.id}
                    onClick={() => void handlePublish(c)}
                  >
                    {c.publishedAt ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${c.name}`}
                    onClick={() => openEdit(c)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${c.name}`}
                    disabled={busyId === c.id}
                    onClick={() => setPendingDelete(c)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {busyId === c.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <TrashIcon />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / edit dialog ─────────────────────────────── */}
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              A launch collection. The slug is used for its storefront URL.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => {
                      const value = e.target.value
                      patch({ name: value })
                      if (!slugTouched) patch({ slug: slugify(value) })
                    }}
                    placeholder="Ready to Wear"
                    className="h-10 rounded-none border-hairline"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      patch({ slug: e.target.value })
                    }}
                    placeholder="ready-to-wear"
                    className="h-10 rounded-none border-hairline"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                  Description
                </Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  rows={2}
                  className="rounded-none border-hairline"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                  Editorial
                </Label>
                <Textarea
                  value={draft.editorial}
                  onChange={(e) => patch({ editorial: e.target.value })}
                  rows={3}
                  placeholder="Long-form copy shown on the collection page…"
                  className="rounded-none border-hairline"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                  Image URL
                </Label>
                <Input
                  value={draft.imageUrl}
                  onChange={(e) => patch({ imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="h-10 rounded-none border-hairline"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">
                    Sort order
                  </Label>
                  <Input
                    value={draft.sortOrder}
                    onChange={(e) => patch({ sortOrder: e.target.value })}
                    inputMode="numeric"
                    className="h-10 rounded-none border-hairline"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-noir">
                    <Checkbox
                      checked={draft.isFeatured}
                      onCheckedChange={(v) => patch({ isFeatured: Boolean(v) })}
                    />
                    Featured collection
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void handleSave()}>
              {saving ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {draft?.id ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────────── */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}</DialogTitle>
            <DialogDescription>
              The collection and its product links are removed permanently. A
              collection that still contains products cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busyId === pendingDelete?.id}
              onClick={() => void handleDelete()}
            >
              <TrashIcon />
              Delete category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
