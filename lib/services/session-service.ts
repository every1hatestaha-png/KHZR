import "server-only"

import { cookies } from "next/headers"
import { CART_COOKIE, CART_TTL_DAYS } from "@/lib/constants"

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
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_TTL_DAYS * 86_400,
  })
}

/**
 * The bag token for the current guest session. Checkout and the bag are
 * guest-first; there is no account to merge into.
 */
export async function sessionToken(): Promise<string | null> {
  return readToken()
}
