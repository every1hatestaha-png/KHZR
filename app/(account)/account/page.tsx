import { PageIntro } from "@/components/shared/page-intro"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Account",
  description: "Manage your KHZR account.",
  path: "/account",
  noindex: true,
})

export default function AccountPage() {
  return (
    <>
      <PageIntro
        kicker="Your Account"
        title="The maison, at your hand."
        description="Orders, address book and saved pieces. Secured by Clerk — arrives with Phase 5."
      />
      <section className="mx-auto flex max-w-[1400px] items-center justify-center border-t border-hairline px-5 py-20 lg:px-10 lg:py-28">
        <p className="font-display text-3xl font-light text-noir lg:text-4xl">
          Your world awaits.
        </p>
      </section>
    </>
  )
}
