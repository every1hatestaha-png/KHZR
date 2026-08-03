import { AdminHeading } from "@/components/admin/admin-heading"
import { HomepageSettingsForm } from "@/components/admin/settings-forms"
import { getAdminCollections, getAdminProducts, getAdminStoreSettings } from "@/lib/data-access/admin"

export const metadata = { title: "Homepage" }
export const dynamic = "force-dynamic"

export default async function AdminHomepagePage() {
  const [settings, products, collections] = await Promise.all([getAdminStoreSettings(), getAdminProducts({ perPage: 100 }), getAdminCollections()])
  return <><AdminHeading kicker="Content" title="Homepage" description="Hero, announcement bar, featured products, featured collections and category links." /><HomepageSettingsForm settings={settings} products={products?.items ?? []} collections={collections ?? []} /></>
}
