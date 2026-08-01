"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { isDatabaseConfigured } from "@/lib/services/cart-service"
import { rateLimit } from "@/lib/services/rate-limit"

const schema = z.object({
  email: z.string().trim().email(),
})

export type NewsletterResult = {
  ok: boolean
  error?: string
}

export async function subscribeNewsletter(
  input: unknown
): Promise<NewsletterResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." }

  const email = parsed.data.email.toLowerCase()

  const allowed = await rateLimit("newsletter", 10, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  if (isDatabaseConfigured()) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { newsletter: true },
      })
    }
    // Guests without an account: subscription is captured at account creation (Phase 5).
  }

  return { ok: true }
}
