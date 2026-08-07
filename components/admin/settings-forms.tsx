"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveHomepageSettingsAction, saveStoreSettingsAction } from "@/lib/actions/admin-actions"
import type { AdminCollectionDTO, AdminProductRow, AdminStoreSettings } from "@/lib/data-access/admin"

export function StoreSettingsForm({ settings }: { settings: AdminStoreSettings }) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState(settings)

  function patch(key: keyof AdminStoreSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await saveStoreSettingsAction(form)
    setSaving(false)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else toast.error(result.error)
  }

  return (
    <form onSubmit={save} className="grid gap-5 border border-hairline bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Store name"><Input value={form.storeName} onChange={(e) => patch("storeName", e.target.value)} /></Field>
        <Field label="Owner notification email"><Input value={form.ownerNotificationEmail} onChange={(e) => patch("ownerNotificationEmail", e.target.value)} /></Field>
        <Field label="Customer support email"><Input value={form.customerSupportEmail} onChange={(e) => patch("customerSupportEmail", e.target.value)} /></Field>
        <Field label="Instagram URL"><Input value={form.instagramUrl} onChange={(e) => patch("instagramUrl", e.target.value)} /></Field>
        <Field label="Facebook URL"><Input value={form.facebookUrl} onChange={(e) => patch("facebookUrl", e.target.value)} /></Field>
      </div>
      <Field label="Contact details"><Textarea rows={4} value={form.contactDetails} onChange={(e) => patch("contactDetails", e.target.value)} /></Field>
      <Field label="Return policy text"><Textarea rows={5} value={form.returnPolicyText} onChange={(e) => patch("returnPolicyText", e.target.value)} /></Field>
      <Field label="Shipping policy text"><Textarea rows={5} value={form.shippingPolicyText} onChange={(e) => patch("shippingPolicyText", e.target.value)} /></Field>
      <Field label="Footer links JSON"><Textarea rows={4} value={form.footerLinks} onChange={(e) => patch("footerLinks", e.target.value)} placeholder='[{"label":"Size & Fit","href":"/size-fit"}]' /></Field>
      <Button type="submit" disabled={saving} className="w-fit">Save store settings</Button>
    </form>
  )
}

export function HomepageSettingsForm({
  settings,
  products,
  collections,
}: {
  settings: AdminStoreSettings
  products: AdminProductRow[]
  collections: AdminCollectionDTO[]
}) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    ...settings,
    featuredProductIds: products.filter((p) => p.isFeatured).map((p) => p.id),
    featuredCollectionIds: collections.filter((c) => c.isFeatured).map((c) => c.id),
  })

  function patch(key: keyof typeof form, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggle(key: "featuredProductIds" | "featuredCollectionIds", id: string) {
    setForm((prev) => {
      const current = prev[key]
      return { ...prev, [key]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] }
    })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await saveHomepageSettingsAction(form)
    setSaving(false)
    if (result.ok) {
      toast.success(result.message)
      router.refresh()
    } else toast.error(result.error)
  }

  return (
    <form onSubmit={save} className="grid gap-6 border border-hairline bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Hero image URL"><Input value={form.heroImageUrl} onChange={(e) => patch("heroImageUrl", e.target.value)} /></Field>
        <Field label="Hero label"><Input value={form.heroLabel} onChange={(e) => patch("heroLabel", e.target.value)} /></Field>
        <Field label="Hero heading"><Input value={form.heroHeading} onChange={(e) => patch("heroHeading", e.target.value)} /></Field>
        <Field label="Hero button text"><Input value={form.heroButtonText} onChange={(e) => patch("heroButtonText", e.target.value)} /></Field>
        <Field label="Hero button link"><Input value={form.heroButtonLink} onChange={(e) => patch("heroButtonLink", e.target.value)} /></Field>
      </div>
      <Field label="Hero description"><Textarea rows={3} value={form.heroDescription} onChange={(e) => patch("heroDescription", e.target.value)} /></Field>
      <div className="grid gap-3">
        <label className="flex items-center gap-3 text-sm text-noir"><Checkbox checked={form.announcementActive} onCheckedChange={(v) => patch("announcementActive", Boolean(v))} /> Announcement active</label>
        <Field label="Announcement text"><Input value={form.announcementText} onChange={(e) => patch("announcementText", e.target.value)} /></Field>
      </div>
      <ChoiceList title="Featured products" items={products.map((p) => ({ id: p.id, label: p.name }))} selected={form.featuredProductIds} onToggle={(id) => toggle("featuredProductIds", id)} />
      <ChoiceList title="Featured collections" items={collections.map((c) => ({ id: c.id, label: c.name }))} selected={form.featuredCollectionIds} onToggle={(id) => toggle("featuredCollectionIds", id)} />
      <Field label="Homepage category links JSON"><Textarea rows={4} value={form.homepageCategoryLinks} onChange={(e) => patch("homepageCategoryLinks", e.target.value)} placeholder='[{"label":"Ready to Wear","href":"/collection/ready-to-wear"}]' /></Field>
      <fieldset className="grid gap-3">
        <legend className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">Launch Edit / Signature section</legend>
        <Field label="Image URL"><Input value={form.signatureImageUrl} onChange={(e) => patch("signatureImageUrl", e.target.value)} placeholder="https://res.cloudinary.com/..." /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Kicker"><Input value={form.signatureKicker} onChange={(e) => patch("signatureKicker", e.target.value)} /></Field>
          <Field label="Title"><Input value={form.signatureTitle} onChange={(e) => patch("signatureTitle", e.target.value)} /></Field>
        </div>
        <Field label="Subtitle"><Textarea rows={3} value={form.signatureSubtitle} onChange={(e) => patch("signatureSubtitle", e.target.value)} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="CTA label"><Input value={form.signatureCtaLabel} onChange={(e) => patch("signatureCtaLabel", e.target.value)} /></Field>
          <Field label="CTA link"><Input value={form.signatureCtaHref} onChange={(e) => patch("signatureCtaHref", e.target.value)} /></Field>
        </div>
      </fieldset>
      <Button type="submit" disabled={saving} className="w-fit">Save homepage</Button>
    </form>
  )
}

function ChoiceList({ title, items, selected, onToggle }: { title: string; items: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => <label key={item.id} className="flex items-center gap-3 border border-hairline p-3 text-sm text-noir"><Checkbox checked={selected.includes(item.id)} onCheckedChange={() => onToggle(item.id)} /> {item.label}</label>)}
      </div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><Label className="text-[0.625rem] uppercase tracking-[0.24em] text-taupe">{label}</Label>{children}</label>
}
