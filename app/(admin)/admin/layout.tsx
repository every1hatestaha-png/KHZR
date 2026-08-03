import { AdminNav } from "@/components/admin/admin-nav"
import { SITE } from "@/lib/constants"
import { getAdminAccess } from "@/lib/services/admin-auth"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: {
    default: "Studio — KHZR",
    template: "%s — KHZR Studio",
  },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await getAdminAccess()

  if (!access.ok) {
    if (access.reason === "signed_out") {
      redirect("/sign-in?redirect_url=/admin")
    }

    return (
      <main className="mx-auto flex min-h-screen max-w-[42rem] flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.34em] text-taupe">
          KHZR Studio
        </p>
        <h1 className="mt-5 font-display text-5xl font-light leading-tight text-noir">
          Administrator access required.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-stone">
          This account is signed in, but it is not authorized to manage KHZR. Ask the owner to set Clerk admin metadata or configure KHZR_ADMIN_EMAIL for the verified owner email.
        </p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminNav />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {children}
        </div>
      </main>
      <span className="sr-only">{SITE.name} administration</span>
    </div>
  )
}
