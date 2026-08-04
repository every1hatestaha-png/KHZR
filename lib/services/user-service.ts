import "server-only"

import { prisma } from "@/lib/prisma"

export type VerifiedClerkIdentity = {
  clerkId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  imageUrl: string | null
  hasImage: boolean
}

function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

function verifiedEmailFromClerkUser(user: {
  primaryEmailAddress?: { emailAddress?: string | null; verification?: { status?: string | null } | null } | null
  emailAddresses?: { emailAddress?: string | null; verification?: { status?: string | null } | null }[]
}) {
  const primaryStatus = user.primaryEmailAddress?.verification?.status?.trim().toLowerCase()
  if (primaryStatus === "verified" && user.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress.emailAddress
  }
  return user.emailAddresses?.find((email) => email.verification?.status?.trim().toLowerCase() === "verified")?.emailAddress ?? null
}

/**
 * The signed-in Clerk user id, or null when signed out / unconfigured.
 *
 * This is the single source of truth for "is there a session". Profile
 * enrichment (which calls the Clerk Backend API and can fail transiently) must
 * never be used to decide whether someone is signed in.
 */
export async function getSessionUserId(): Promise<string | null> {
  if (!clerkConfigured()) return null
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const { userId } = await auth()
    return userId ?? null
  } catch (error) {
    console.warn(
      `[user-service] session lookup failed${error instanceof Error ? ` (${error.message})` : ""}`
    )
    return null
  }
}

/**
 * Resolves the current Clerk session to a storefront user row, creating the
 * user the first time they appear. Returns null when signed out or unconfigured.
 */
export async function resolveDbUser(): Promise<{ id: string } | null> {
  const userId = await getSessionUserId()
  if (!userId) return null
  try {
    return await getOrCreateUserByClerkId(userId)
  } catch (error) {
    console.error(
      `[user-service] could not resolve storefront user${error instanceof Error ? ` (${error.message})` : ""}`
    )
    return null
  }
}

export async function resolveVerifiedClerkIdentity(): Promise<VerifiedClerkIdentity | null> {
  if (!clerkConfigured()) return null
  try {
    const { clerkClient } = await import("@clerk/nextjs/server")
    const userId = await getSessionUserId()
    if (!userId) return null
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = verifiedEmailFromClerkUser(clerkUser)
    return {
      clerkId: userId,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      email,
      imageUrl: clerkUser.hasImage ? (clerkUser.imageUrl ?? null) : null,
      hasImage: clerkUser.hasImage,
    }
  } catch (error) {
    console.warn(
      `[user-service] profile lookup failed${error instanceof Error ? ` (${error.message})` : ""}`
    )
    return null
  }
}

export async function getOrCreateUserByClerkId(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } })
  if (existing) return existing

  let email: string | null = null
  let firstName: string | null = null
  let lastName: string | null = null
  try {
    const { clerkClient } = await import("@clerk/nextjs/server")
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkId)
    email = verifiedEmailFromClerkUser(clerkUser)
    firstName = clerkUser.firstName ?? null
    lastName = clerkUser.lastName ?? null
  } catch {
    // Profile unavailable — fall back to a synthetic email below.
  }

  // The clerkId is the stable external identity. When the verified Clerk email
  // already maps to a storefront row (for example a pre-Clerk account), adopt
  // that row instead of creating a second user, so orders and addresses are
  // preserved and the email stays unique.
  if (email) {
    const byEmail = await prisma.user.findUnique({ where: { email } })
    if (byEmail) {
      if (byEmail.clerkId === clerkId) return byEmail
      return prisma.user.update({
        where: { id: byEmail.id },
        data: {
          clerkId,
          firstName: firstName ?? byEmail.firstName,
          lastName: lastName ?? byEmail.lastName,
          email,
        },
      })
    }
  }

  const createData = {
    clerkId,
    email: email ?? `${clerkId}@local.invalid`,
    firstName,
    lastName,
  }

  try {
    return await prisma.user.create({ data: createData })
  } catch {
    // Concurrent create or an email collision — adopt the existing row.
    const retry = await prisma.user.findUnique({ where: { clerkId } })
    if (retry) return retry
    const byEmail = email ? await prisma.user.findUnique({ where: { email } }) : null
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: {
          clerkId,
          firstName: firstName ?? byEmail.firstName,
          lastName: lastName ?? byEmail.lastName,
          email,
        },
      })
    }
    return prisma.user.create({
      data: { ...createData, email: `${clerkId}-${Date.now()}@local.invalid` },
    })
  }
}
