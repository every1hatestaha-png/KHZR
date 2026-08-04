import { SignUp } from "@clerk/nextjs"
import { AuthIntentTracker } from "@/components/analytics/event-trackers"
import { buildMetadata } from "@/lib/seo"

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export const metadata = buildMetadata({
  title: "Create account",
  description: "Create a KHZR account.",
  path: "/sign-up",
  noindex: true,
})

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-8 px-5 py-24 lg:px-10">
      <AuthIntentTracker kind="sign_up" />
      <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
        <span className="h-px w-8 bg-champagne" aria-hidden />
        KHZR Account
      </p>
      <h1 className="font-display text-4xl font-light tracking-tight text-noir lg:text-5xl">
        Create an account.
      </h1>
      {clerkConfigured ? (
        // Theme comes from ClerkClientProvider in (auth)/layout.tsx.
        <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/account" />
      ) : (
        <p className="max-w-md text-center text-sm leading-relaxed text-taupe">
          Account creation is temporarily unavailable. The storefront,
          catalogue and bag work without signing in.
        </p>
      )}
    </main>
  )
}
