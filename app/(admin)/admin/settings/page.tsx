import { AdminHeading } from "@/components/admin/admin-heading"
import { StoreSettingsForm } from "@/components/admin/settings-forms"
import { getAdminStoreSettings } from "@/lib/data-access/admin"

export const metadata = { title: "Store Settings" }
export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getAdminStoreSettings()
  return <><AdminHeading kicker="Settings" title="Store Settings" description="Store identity, contact, policy and footer content. Server secrets are not exposed here." /><StoreSettingsForm settings={settings} /></>
}
