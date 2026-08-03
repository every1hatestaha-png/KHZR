"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CopyIcon, TrashIcon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveMediaAssetAction, deleteMediaAssetAction, uploadImageAction } from "@/lib/actions/admin-actions"
import type { AdminMediaAsset } from "@/lib/data-access/admin"

export function MediaLibrary({ assets }: { assets: AdminMediaAsset[] }) {
  const router = useRouter()
  const [url, setUrl] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  async function addUrl(e: React.FormEvent) {
    e.preventDefault()
    const result = await saveMediaAssetAction({ url, alt })
    if (result.ok) {
      toast.success(result.message)
      setUrl("")
      setAlt("")
      router.refresh()
    } else toast.error(result.error)
  }

  async function upload(files: FileList | null) {
    const selected = Array.from(files ?? [])
    if (selected.length === 0) return
    setUploading(true)
    let uploaded = 0
    for (const file of selected) {
      const fd = new FormData()
      fd.set("file", file)
      const result = await uploadImageAction(fd)
      if (result.ok) uploaded++
      else toast.error(`${file.name}: ${result.error}`)
    }
    setUploading(false)
    if (uploaded > 0) {
      toast.success(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.`)
      router.refresh()
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  async function remove(asset: AdminMediaAsset) {
    if (!window.confirm("Delete this unused image from the media library?")) return
    const result = await deleteMediaAssetAction(asset.id)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else toast.error(result.error)
  }

  return (
    <div className="grid gap-6">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
      <form onSubmit={addUrl} className="grid gap-3 border border-hairline bg-card p-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" />
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text" />
        <Button type="submit" variant="outline">Save URL</Button>
        <Button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}><UploadIcon />Upload</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset) => (
          <div key={asset.id} className="border border-hairline bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.alt ?? ""} className="aspect-[4/5] w-full object-cover" />
            <div className="grid gap-2 p-3">
              <p className="truncate text-xs text-taupe">{asset.alt || asset.publicId || asset.url}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(asset.url).then(() => toast.success("Image URL copied."))}><CopyIcon />Copy URL</Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => void remove(asset)}><TrashIcon />Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
