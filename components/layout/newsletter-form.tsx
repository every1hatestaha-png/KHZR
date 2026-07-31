"use client"

import * as React from "react"
import { useTransition } from "react"
import { ArrowRight, Check } from "lucide-react"
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
          "flex items-center gap-3 text-sm text-stone",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Check className="size-4 stroke-[1.5] text-champagne" aria-hidden />
        Thank you — you are on the list.
      </p>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex items-end gap-3", className)}
    >
      <label className="flex flex-1 flex-col gap-2">
        <span className="text-[0.625rem] uppercase tracking-[0.28em] text-taupe">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 w-full rounded-none border-b border-noir/25 bg-transparent text-sm text-noir placeholder:text-taupe/60 focus:border-champagne focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        aria-label="Subscribe"
        className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-noir/25 text-noir transition-all duration-300 hover:border-noir hover:bg-noir hover:text-warm-white disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </form>
  )
}
