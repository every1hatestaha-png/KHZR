"use server"

import { cookies } from "next/headers"
import { CART_COOKIE, CART_TTL_DAYS } from "@/lib/constants"
import {
  addToCart,
  clearCart,
  ensureCartToken,
  getCartState,
  removeCartItem,
  resolveCartForUser,
  updateCartQuantity,
} from "@/lib/services/cart-service"
import {
  addItemSchema,
  removeItemSchema,
  updateQuantitySchema,
} from "@/lib/validations/cart"
import type { CartActionResult } from "@/types"

async function readToken() {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value ?? null
}

async function persistToken(token: string) {
  const store = await cookies()
  store.set(CART_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: CART_TTL_DAYS * 86_400,
  })
}

/** Clerk user id for the current session, or null when signed out / unconfigured. */
async function resolveClerkId(): Promise<string | null> {
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
async function sessionToken(): Promise<string | null> {
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

export async function getCartAction(): Promise<CartActionResult> {
  const token = await sessionToken()
  const cart = await getCartState(token)
  return { ok: true, cart }
}

export async function addItemAction(
  input: unknown
): Promise<CartActionResult> {
  const parsed = addItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read.", cart: null }
  }

  const { variantId, quantity } = parsed.data
  const clerkId = await resolveClerkId()
  let token = await readToken()
  if (clerkId) {
    const resolved = await resolveCartForUser(clerkId, token)
    if (resolved) {
      token = resolved.token
      await persistToken(token)
    }
  }
  if (!token) {
    const created = await ensureCartToken(null, clerkId)
    if (created) {
      token = created
      await persistToken(token)
    }
  }
  if (token) {
    await addToCart(token, { variantId, quantity })
    const cart = await getCartState(token)
    return { ok: true, cart }
  }

  // No persistence configured — the client keeps its optimistic state.
  return { ok: true, cart: null }
}

export async function updateQuantityAction(
  input: unknown
): Promise<CartActionResult> {
  const parsed = updateQuantitySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read.", cart: null }
  }

  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }

  await updateCartQuantity(token, parsed.data.lineId, parsed.data.quantity)
  const cart = await getCartState(token)
  return { ok: true, cart }
}

export async function removeItemAction(
  input: unknown
): Promise<CartActionResult> {
  const parsed = removeItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read.", cart: null }
  }

  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }

  await removeCartItem(token, parsed.data.lineId)
  const cart = await getCartState(token)
  return { ok: true, cart }
}

export async function clearCartAction(): Promise<CartActionResult> {
  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }
  await clearCart(token)
  return { ok: true, cart: await getCartState(token) }
}
