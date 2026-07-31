import "server-only"

import { cookies } from "next/headers"
import { CART_COOKIE, CART_TTL_DAYS } from "@/lib/constants"
import { resolveCartForUser } from "@/lib/services/cart-service"

export async function readToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value ?? null
}

export async function persistToken(token: string) {
  const store = await cookies()
  store.set(CART_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: CART_TTL_DAYS * 86_400,
  })
}

/** Clerk user id for the current session, or null when signed out / unconfigured. */
export async function resolveClerkId(): Promise<string | null> {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    return null
  }
  try {
    const { auth } = await import("@clerk/nextjs/server")
    return (await auth()).userId ?? null
  } catch {
    return null
  }
}

/**
 * Resolves the token for the session: when signed in, links or merges the
 * anonymous cart into the user's account cart and refreshes the cookie.
 */
export async function sessionToken(): Promise<string | null> {
  const clerkId = await resolveClerkId()
  let token = await readToken()
  if (clerkId) {
    const resolved = await resolveCartForUser(clerkId, token)
    if (resolved) {
      token = resolved.token
      await persistToken(token)
    }
  }
  return token
}
