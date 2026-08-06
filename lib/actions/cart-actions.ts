"use server"

import {
  addToCart,
  CartServiceError,
  clearCart,
  ensureCartToken,
  getCartState,
  removeCartItem,
  updateCartQuantity,
} from "@/lib/services/cart-service"
import {
  readToken,
  sessionToken,
  persistToken,
} from "@/lib/services/session-service"
import {
  addItemSchema,
  removeItemSchema,
  updateQuantitySchema,
} from "@/lib/validations/cart"
import { rateLimit } from "@/lib/services/rate-limit"
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
  const allowed = await rateLimit("cart:add", 120, 15 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please slow down and try again shortly.", cart: null }

  const { variantId, quantity } = parsed.data
  let token = await readToken()
  if (!token) {
    const created = await ensureCartToken(null)
    if (created) {
      token = created
      await persistToken(token)
    }
  }
  if (token) {
    try {
      await addToCart(token, { variantId, quantity })
      const cart = await getCartState(token)
      return { ok: true, cart }
    } catch (error) {
      if (error instanceof CartServiceError) {
        return { ok: false, error: error.message, cart: await getCartState(token) }
      }
      return { ok: false, error: "This item could not be added to your bag.", cart: await getCartState(token) }
    }
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
  const allowed = await rateLimit("cart:update", 180, 15 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please slow down and try again shortly.", cart: null }

  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }

  try {
    await updateCartQuantity(token, parsed.data.lineId, parsed.data.quantity)
    const cart = await getCartState(token)
    return { ok: true, cart }
  } catch (error) {
    if (error instanceof CartServiceError) {
      return { ok: false, error: error.message, cart: await getCartState(token) }
    }
    return { ok: false, error: "Quantity could not be updated.", cart: await getCartState(token) }
  }
}

export async function removeItemAction(
  input: unknown
): Promise<CartActionResult> {
  const parsed = removeItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read.", cart: null }
  }
  const allowed = await rateLimit("cart:remove", 180, 15 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please slow down and try again shortly.", cart: null }

  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }

  await removeCartItem(token, parsed.data.lineId)
  const cart = await getCartState(token)
  return { ok: true, cart }
}

export async function clearCartAction(): Promise<CartActionResult> {
  const allowed = await rateLimit("cart:clear", 60, 15 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please slow down and try again shortly.", cart: null }
  const token = await sessionToken()
  if (!token) return { ok: true, cart: null }
  await clearCart(token)
  return { ok: true, cart: await getCartState(token) }
}
