import { AdminHeading } from "@/components/admin/admin-heading"
import { MediaLibrary } from "@/components/admin/media-library"
import { getAdminMediaAssets } from "@/lib/data-access/admin"

export const metadata = { title: "Media" }
export const dynamic = "force-dynamic"

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const raw = await searchParams
  const q = stringParam(raw.q)
  const assets = await getAdminMediaAssets(q)
  return <><AdminHeading kicker="Assets" title="Media Library" description="Upload, search, copy and reuse images across products and homepage content." /><form className="mb-4"><input name="q" defaultValue={q ?? ""} placeholder="Search images" className="h-10 w-full border border-hairline bg-card px-3 text-sm" /></form><MediaLibrary assets={assets} /></>
}
