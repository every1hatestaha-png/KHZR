import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/account/profile-form"
import { getAccountProfile } from "@/lib/data-access/account"
import { resolveDbUser } from "@/lib/services/user-service"
import { isStoreOwner } from "@/lib/services/admin-auth"
import { OwnerBadge } from "@/components/account/owner-badge"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({ title: "Profile", description: "Manage your KHZR profile.", path: "/account/profile", noindex: true })
export const dynamic = "force-dynamic"

export default async function AccountProfilePage() {
  const user = await resolveDbUser()
  if (!user) return <SignedOut title="Sign in to edit your profile." />
  const [profile, isOwner] = await Promise.all([getAccountProfile(user.id), isStoreOwner()])

  return (
    <>
      <PageIntro kicker="Account" title="Profile." description="Keep your Pakistan contact details current." />
      <section className="mx-auto flex max-w-[900px] flex-col gap-5 border-t border-hairline px-5 py-16 lg:px-10">
        {isOwner ? <OwnerBadge /> : null}
        <ProfileForm profile={profile} />
      </section>
    </>
  )
}

function SignedOut({ title }: { title: string }) {
  return (
    <>
      <PageIntro kicker="Account" title={title} />
      <section className="mx-auto flex max-w-[1400px] justify-center border-t border-hairline px-5 py-16 lg:px-10">
        <Button asChild><Link href="/sign-in">Sign in</Link></Button>
      </section>
    </>
  )
}
