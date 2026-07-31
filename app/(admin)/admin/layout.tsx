import { AdminNav } from "@/components/admin/admin-nav"
import { SITE } from "@/lib/constants"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Studio — KHZR",
    template: "%s — KHZR Studio",
  },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminNav />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {children}
        </div>
      </main>
      <span className="sr-only">{SITE.name} administration</span>
    </div>
  )
}
