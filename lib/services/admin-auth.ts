import "server-only"

type AdminAccess =
  | { ok: true; reason: "metadata" | "email" | "development" }
  | { ok: false; reason: "signed_out" | "not_admin" | "auth_unconfigured" | "auth_error" }

export function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

function normalizedEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null
}

function adminEmail() {
  return normalizedEmail(process.env.KHZR_ADMIN_EMAIL)
}

function metadataRole(sessionClaims: unknown): string | null {
  const claims = sessionClaims as { metadata?: { role?: string }; publicMetadata?: { role?: string } } | null
  return claims?.metadata?.role ?? claims?.publicMetadata?.role ?? null
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!clerkConfigured()) {
    return process.env.NODE_ENV === "production"
      ? { ok: false, reason: "auth_unconfigured" }
      : { ok: true, reason: "development" }
  }

  try {
    const { auth, clerkClient } = await import("@clerk/nextjs/server")
    const session = await auth()
    if (!session.userId) return { ok: false, reason: "signed_out" }

    if (metadataRole(session.sessionClaims) === "admin") {
      return { ok: true, reason: "metadata" }
    }

    const configuredAdminEmail = adminEmail()
    if (configuredAdminEmail) {
      const client = await clerkClient()
      const user = await client.users.getUser(session.userId)
      const verifiedEmails = user.emailAddresses
        .filter((email) => email.verification?.status === "verified")
        .map((email) => normalizedEmail(email.emailAddress))
      if (verifiedEmails.includes(configuredAdminEmail)) {
        return { ok: true, reason: "email" }
      }
    }

    return { ok: false, reason: "not_admin" }
  } catch {
    return { ok: false, reason: "auth_error" }
  }
}

export async function requireAdminAccess(): Promise<string | null> {
  const access = await getAdminAccess()
  if (access.ok) return null
  if (access.reason === "signed_out") return "Sign in to access the KHZR studio."
  if (access.reason === "auth_unconfigured") return "Authentication is not configured."
  if (access.reason === "auth_error") return "Authentication could not be verified."
  return "You must be signed in as an administrator."
}
