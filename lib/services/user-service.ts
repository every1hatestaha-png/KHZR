import "server-only"

import { prisma } from "@/lib/prisma"

function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

/**
 * Resolves the current Clerk session to a storefront user row, creating the
 * user the first time they appear. Returns null when signed out or unconfigured.
 */
export async function resolveDbUser(): Promise<{ id: string } | null> {
  if (!clerkConfigured()) return null
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const { userId } = await auth()
    if (!userId) return null
    return getOrCreateUserByClerkId(userId)
  } catch {
    return null
  }
}

export async function getOrCreateUserByClerkId(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } })
  if (existing) return existing

  let email = `${clerkId}@local.invalid`
  let firstName: string | null = null
  let lastName: string | null = null
  try {
    const { clerkClient } = await import("@clerk/nextjs/server")
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkId)
    email = clerkUser.primaryEmailAddress?.emailAddress ?? email
    firstName = clerkUser.firstName ?? null
    lastName = clerkUser.lastName ?? null
  } catch {
    // Profile unavailable — fall back to a synthetic email.
  }

  try {
    return await prisma.user.create({
      data: { clerkId, email, firstName, lastName },
    })
  } catch {
    const retry = await prisma.user.findUnique({ where: { clerkId } })
    if (retry) return retry
    return prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}-${Date.now()}@local.invalid`,
        firstName,
        lastName,
      },
    })
  }
}
