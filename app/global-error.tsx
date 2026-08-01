"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-warm-white font-sans text-noir antialiased">
        <main className="mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center gap-6 px-5 py-24 text-center">
          <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            <span className="h-px w-8 bg-champagne" aria-hidden />
            Something paused
          </p>
          <h1 className="font-display text-5xl font-light leading-tight tracking-tight">
            Something went wrong.
          </h1>
      <p className="max-w-md text-sm leading-relaxed text-stone">
            Refresh the page or try again in a moment.
      </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Button onClick={reset}>Try Again</Button>
            <Button asChild variant="ghost">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
