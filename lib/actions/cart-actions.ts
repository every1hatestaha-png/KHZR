"use server"

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
  readToken,
  resolveClerkId,
  sessionToken,
  persistToken,
} from "@/lib/services/session-service"
import {
  addItemSchema,
  removeItemSchema,
  updateQuantitySchema,
} from "@/lib/validations/cart"
import type { CartActionResult } from "@/types"

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
