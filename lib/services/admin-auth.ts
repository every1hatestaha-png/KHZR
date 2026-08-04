import "server-only"

export type AdminDenialReason =
  | "signed_out"
  | "not_admin"
  | "email_unverified"
  | "not_configured"
  | "auth_unconfigured"
  | "auth_error"

export type AdminAccess =
  | { ok: true; reason: "metadata" | "email" | "development" }
  | { ok: false; reason: AdminDenialReason }

/** Roles that may administer KHZR. Compared case-insensitively. */
const ADMIN_ROLES = new Set(["admin", "owner", "store_owner", "store-owner", "superadmin"])

export const ADMIN_DENIAL_MESSAGE: Record<AdminDenialReason, string> = {
  signed_out: "Sign in to access the KHZR studio.",
  not_admin: "Administrator access is required.",
  email_unverified:
    "This email is registered as the store owner but is not verified in Clerk. Verify it from your account, then sign in again.",
  not_configured: "Administrator access has not been configured for this store yet.",
  auth_unconfigured: "Authentication is not configured.",
  auth_error: "We could not verify your access. Please sign in again.",
}

export function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

function normalizedEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null
}

/**
 * Owner emails come from KHZR_ADMIN_EMAIL (single) and KHZR_ADMIN_EMAILS
 * (comma, semicolon or whitespace separated). Both are server-only.
 */
function adminEmails(): string[] {
  const raw = [process.env.KHZR_ADMIN_EMAIL, process.env.KHZR_ADMIN_EMAILS]
    .filter(Boolean)
    .join(",")
  const emails = new Set<string>()
  for (const part of raw.split(/[,;\s]+/)) {
    const email = normalizedEmail(part)
    if (email) emails.add(email)
  }
  return [...emails]
}

function isAdminRole(role: string | null) {
  return Boolean(role && ADMIN_ROLES.has(role))
}

/** Reads `{ role }` off any Clerk metadata bag. */
function roleFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null
  const role = (metadata as { role?: unknown }).role
  return typeof role === "string" ? role.trim().toLowerCase() || null : null
}

/**
 * Session tokens only carry metadata when a custom claim is configured on the
 * Clerk instance, so this is a fast path — never the only check.
 */
function sessionRole(sessionClaims: unknown): string | null {
  if (!sessionClaims || typeof sessionClaims !== "object") return null
  const claims = sessionClaims as Record<string, unknown>
  for (const key of ["metadata", "publicMetadata", "public_metadata"]) {
    const role = roleFromMetadata(claims[key])
    if (role) return role
  }
  const role = claims.role
  return typeof role === "string" ? role.trim().toLowerCase() || null : null
}

type ClerkEmailLike = {
  emailAddress?: string | null
  verification?: { status?: string | null } | null
}

/** Splits a Clerk user's addresses into verified and unverified sets. */
function collectEmails(user: {
  primaryEmailAddress?: ClerkEmailLike | null
  emailAddresses?: ClerkEmailLike[]
}) {
  const verified = new Set<string>()
  const unverified = new Set<string>()

  const add = (entry?: ClerkEmailLike | null) => {
    const email = normalizedEmail(entry?.emailAddress)
    if (!email) return
    if (entry?.verification?.status?.trim().toLowerCase() === "verified") verified.add(email)
    else unverified.add(email)
  }

  add(user.primaryEmailAddress)
  for (const entry of user.emailAddresses ?? []) add(entry)

  return {
    verified: [...verified],
    unverified: [...unverified].filter((email) => !verified.has(email)),
  }
}

/**
 * Short, safe guidance for the account menu when a signed-in user is not an
 * admin. Never reveals the owner email or any configuration detail. Returns
 * null when the menu should stay quiet.
 */
export function adminNoteForMenu(reason: AdminDenialReason): string | null {
  switch (reason) {
    case "email_unverified":
      return "Verify your email in Clerk, then sign in again, to access the studio."
    case "auth_error":
      return "We could not verify your access. Please sign in again."
    case "not_configured":
      return "The store owner has not configured administrator access yet."
    case "not_admin":
    case "signed_out":
    case "auth_unconfigured":
      return null
  }
}

/** Diagnostics only. Never logs secrets or a full owner address. */
function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!domain) return "***"
  return `${name.slice(0, 2)}***@${domain}`
}

function logAdmin(message: string, error?: unknown) {
  const detail = error instanceof Error ? ` (${error.message})` : ""
  console.warn(`[admin-auth] ${message}${detail}`)
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!clerkConfigured()) {
    if (process.env.NODE_ENV === "production") {
      logAdmin("Clerk keys are missing in production; denying admin access")
      return { ok: false, reason: "auth_unconfigured" }
    }
    return { ok: true, reason: "development" }
  }

  let userId: string
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const session = await auth()
    if (!session.userId) return { ok: false, reason: "signed_out" }
    userId = session.userId

    // Fast path: only fires when the instance injects metadata claims.
    if (isAdminRole(sessionRole(session.sessionClaims))) {
      return { ok: true, reason: "metadata" }
    }
  } catch (error) {
    logAdmin("session lookup failed", error)
    return { ok: false, reason: "auth_error" }
  }

  try {
    const { clerkClient } = await import("@clerk/nextjs/server")
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Authoritative role check: metadata straight off the Backend API, which
    // does not depend on any custom session-token claim being configured.
    const role = roleFromMetadata(user.publicMetadata) ?? roleFromMetadata(user.privateMetadata)
    if (isAdminRole(role)) return { ok: true, reason: "metadata" }

    const configured = adminEmails()
    if (configured.length === 0) {
      logAdmin(
        "denied (not_configured): KHZR_ADMIN_EMAIL (and KHZR_ADMIN_EMAILS) are unset in this runtime environment. Set KHZR_ADMIN_EMAIL to the verified owner email in Vercel env."
      )
      return { ok: false, reason: "not_configured" }
    }

    const { verified, unverified } = collectEmails(user)
    if (verified.some((email) => configured.includes(email))) {
      logAdmin(`granted via verified email (configured owner emails=${configured.length})`)
      return { ok: true, reason: "email" }
    }

    const unverifiedMatch = unverified.find((email) => configured.includes(email))
    if (unverifiedMatch) {
      logAdmin(`owner email ${maskEmail(unverifiedMatch)} matched but is not verified`)
      return { ok: false, reason: "email_unverified" }
    }

    logAdmin(
      `denied (not_admin): role=${role ?? "none"}, verified=${verified.length}, unverified=${unverified.length}, configured owner emails=${configured.length}`
    )
    return { ok: false, reason: "not_admin" }
  } catch (error) {
    logAdmin("Clerk user lookup failed", error)
    return { ok: false, reason: "auth_error" }
  }
}

/** Returns an error message when the caller is not an admin, else null. */
export async function requireAdminAccess(): Promise<string | null> {
  const access = await getAdminAccess()
  return access.ok ? null : ADMIN_DENIAL_MESSAGE[access.reason]
}

/** Convenience predicate for UI that only needs a boolean. */
export async function isStoreOwner(): Promise<boolean> {
  const access = await getAdminAccess()
  return access.ok
}
