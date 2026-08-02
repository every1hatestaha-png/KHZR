import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { getAccountProfile } from "@/lib/data-access/account"
import { resolveDbUser } from "@/lib/services/user-service"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({ title: "Account Settings", description: "Manage KHZR account settings.", path: "/account/settings", noindex: true })
export const dynamic = "force-dynamic"

export default async function AccountSettingsPage() {
  const user = await resolveDbUser()
  if (!user) {
    return (
      <>
        <PageIntro kicker="Account" title="Sign in to view settings." />
        <section className="mx-auto flex max-w-[1400px] justify-center border-t border-hairline px-5 py-16 lg:px-10">
          <Button asChild><Link href="/sign-in">Sign in</Link></Button>
        </section>
      </>
    )
  }
  const profile = await getAccountProfile(user.id)
  return (
    <>
      <PageIntro kicker="Account" title="Settings." description="Clerk secures sign-in and identity for your KHZR account." />
      <section className="mx-auto grid max-w-[900px] gap-6 border-t border-hairline px-5 py-16 lg:px-10">
        <div className="border border-hairline bg-card p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Sign-in email</p>
          <p className="mt-2 font-display text-2xl text-noir">{profile.email || "Managed by Clerk"}</p>
          <p className="mt-3 text-sm leading-relaxed text-stone">Use Clerk account controls for password, passkeys, or sign-in email changes. Store contact details can be edited in your profile.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link href="/account/profile">Edit Profile</Link></Button>
          <Button asChild variant="outline"><Link href="/account/addresses">Manage Addresses</Link></Button>
        </div>
      </section>
    </>
  )
}
