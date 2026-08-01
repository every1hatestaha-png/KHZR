"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  Loader2Icon,
  TrashIcon,
  UploadIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImageAction } from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

export type ManagedImage = {
  url: string
  alt: string
}

type ImageManagerProps = {
  value: ManagedImage[]
  onChange: (next: ManagedImage[]) => void
  disabled?: boolean
}

export function ImageManager({ value, onChange, disabled }: ImageManagerProps) {
  const [url, setUrl] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  function addUrl(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    onChange([...value, { url: trimmed, alt }])
    setUrl("")
    setAlt("")
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function setAltAt(index: number, text: string) {
    const next = [...value]
    next[index] = { ...next[index], alt: text }
    onChange(next)
  }

  async function handleUpload(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.set("file", file)
    const result = await uploadImageAction(fd)
    setUploading(false)
    if (result.ok) {
      onChange([...value, { url: result.url, alt: file.name }])
      toast.success("Image uploaded.")
    } else {
      toast.error(result.error)
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleUpload(e.target.files)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {value.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className={cn(
              "relative flex flex-col border border-hairline bg-card",
              i === 0 && "border-noir"
            )}
          >
            {i === 0 ? (
              <span className="absolute left-0 top-0 z-10 bg-noir px-2 py-1 text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-warm-white">
                Primary
              </span>
            ) : null}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || "Product image"}
                className="size-full object-cover"
                width={400}
                height={500}
              />
            </div>
            <div className="flex flex-col gap-2 p-3">
              <Input
                value={image.alt}
                onChange={(e) => setAltAt(i, e.target.value)}
                placeholder="Alt text"
                className="h-8 rounded-none border-hairline text-xs"
                aria-label={`Alt text for image ${i + 1}`}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === 0 || disabled}
                    aria-label="Move image up"
                    onClick={() => move(i, -1)}
                  >
                    <ChevronUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === value.length - 1 || disabled}
                    aria-label="Move image down"
                    onClick={() => move(i, 1)}
                  >
                    <ChevronDownIcon />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label="Remove image"
                  onClick={() => removeAt(i)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {value.length === 0 ? (
          <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 border border-dashed border-input bg-card px-6 text-center sm:col-span-2 lg:col-span-3">
            <ImageIcon className="size-6 text-taupe" aria-hidden />
            <p className="text-sm text-stone">
              No images yet. Upload a file, or paste an image URL below.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border border-hairline bg-card p-3">
        <Label className="text-[0.625rem] font-medium uppercase tracking-[0.24em] text-taupe">
          Add an image
        </Label>
        <form onSubmit={addUrl} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-…"
            className="h-10 flex-1 rounded-none border-hairline"
            aria-label="Image URL"
          />
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (optional)"
            className="h-10 flex-1 rounded-none border-hairline"
            aria-label="Alt text"
          />
          <Button type="submit" variant="outline" className="h-10 rounded-none">
            Add URL
          </Button>
        </form>
        <Button
          type="button"
          variant="secondary"
          className="h-10 rounded-none"
          disabled={uploading || disabled}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <UploadIcon />
          )}
          {uploading ? "Uploading…" : "Upload from device"}
        </Button>
      </div>
    </div>
  )
}
