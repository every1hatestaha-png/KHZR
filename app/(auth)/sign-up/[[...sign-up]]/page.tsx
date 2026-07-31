import { SignUp } from "@clerk/nextjs"
import { buildMetadata } from "@/lib/seo"

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export const metadata = buildMetadata({
  title: "Create account",
  description: "Create a KHZR account.",
  path: "/sign-up",
})

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-8 px-5 py-24 lg:px-10">
      <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
        <span className="h-px w-8 bg-champagne" aria-hidden />
        Join the Maison
      </p>
      <h1 className="font-display text-4xl font-light tracking-tight text-noir lg:text-5xl">
        Create an account.
      </h1>
      {clerkConfigured ? (
        <SignUp
          appearance={{
            elements: {
              card: "!shadow-none !border !border-hairline !rounded-none",
              formButtonPrimary:
                "!bg-noir !text-warm-white !rounded-none hover:!bg-stone",
              footerActionLink: "!text-champagne",
            },
          }}
        />
      ) : (
        <p className="max-w-md text-center text-sm leading-relaxed text-taupe">
          Account access arrives with Clerk authentication (Phase 5). The
          storefront, catalogue and bag work without signing in.
        </p>
      )}
    </main>
  )
}
