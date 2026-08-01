import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Page not found",
  description: "The page you are looking for does not exist.",
  path: "/404",
  noindex: true,
})

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-6 px-5 py-24 text-center lg:px-10">
      <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
        <span className="h-px w-8 bg-champagne" aria-hidden />
        Error 404
      </p>
      <h1 className="font-display text-5xl font-light leading-tight tracking-tight text-noir lg:text-7xl">
        This page has been retired.
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-stone">
        The address you followed no longer exists in the maison.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Return Home</Link>
      </Button>
    </main>
  )
}
