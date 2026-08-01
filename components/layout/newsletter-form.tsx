"use client"

import * as React from "react"
import { useTransition } from "react"
import { ArrowRight } from "lucide-react"
import { subscribeNewsletter } from "@/lib/actions/newsletter-actions"
import { cn } from "@/lib/utils"

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "done">("idle")
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await subscribeNewsletter({ email })
      if (res.ok) {
        setStatus("done")
      }
    })
  }

  if (status === "done") {
    return (
      <p
        className={cn(
          "border-y border-hairline py-3 text-sm leading-relaxed text-stone",
          className
        )}
        role="status"
        aria-live="polite"
      >
        Thank you. You are on the list.
      </p>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex items-end gap-3", className)}
    >
      <label htmlFor="newsletter-email" className="flex flex-1 flex-col gap-2">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
          Email
        </span>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 w-full rounded-none border-b border-hairline bg-transparent text-sm text-noir placeholder:text-taupe/60 transition-colors duration-300 ease-lux focus:border-noir focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        aria-label="Subscribe"
        className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-hairline text-noir transition-colors duration-300 ease-lux hover:border-noir hover:bg-noir hover:text-warm-white disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </form>
  )
}
