import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { AddressBook } from "@/components/account/address-book"
import { listAccountAddresses } from "@/lib/data-access/account"
import { resolveDbUser } from "@/lib/services/user-service"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({ title: "Saved Addresses", description: "Manage your KHZR address book.", path: "/account/addresses", noindex: true })
export const dynamic = "force-dynamic"

export default async function AccountAddressesPage() {
  const user = await resolveDbUser()
  if (!user) {
    return (
      <>
        <PageIntro kicker="Account" title="Sign in to manage addresses." />
        <section className="mx-auto flex max-w-[1400px] justify-center border-t border-hairline px-5 py-16 lg:px-10">
          <Button asChild><Link href="/sign-in">Sign in</Link></Button>
        </section>
      </>
    )
  }
  const addresses = await listAccountAddresses(user.id)
  return (
    <>
      <PageIntro kicker="Account" title="Address book." description="Save delivery details for faster Pakistan checkout." />
      <section className="mx-auto max-w-[1100px] border-t border-hairline px-5 py-16 lg:px-10">
        <AddressBook addresses={addresses} />
      </section>
    </>
  )
}
