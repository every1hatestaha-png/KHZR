"use server"

import { resolveDbUser } from "@/lib/services/user-service"
import {
  clearWishlist,
  getWishlist,
  mergeWishlist,
  toggleWishlist,
} from "@/lib/services/wishlist-service"
import {
  mergeWishlistSchema,
  toggleWishlistSchema,
} from "@/lib/validations/wishlist"
import { rateLimit, rateLimitKey } from "@/lib/services/rate-limit"
import type { WishlistActionResult } from "@/types"

export async function getWishlistAction(): Promise<WishlistActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: true, items: [] }
  const items = await getWishlist(user.id)
  return { ok: true, items }
}

export async function toggleWishlistAction(
  input: unknown
): Promise<WishlistActionResult> {
  const parsed = toggleWishlistSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read." }
  }

  const user = await resolveDbUser()
  if (!user) {
    return { ok: false, error: "Sign in to save pieces." }
  }
  const allowed = await rateLimit("wishlist:toggle", 80, 15 * 60 * 1000)
  const allowedUser = await rateLimitKey("wishlist:user", user.id, 120, 60 * 60 * 1000)
  if (!allowed || !allowedUser) return { ok: false, error: "Please slow down and try again shortly." }

  const items = await toggleWishlist(user.id, parsed.data.productSlug)
  if (items === null) {
    return { ok: false, error: "That piece could not be found." }
  }
  return { ok: true, items }
}

export async function mergeWishlistAction(
  input: unknown
): Promise<WishlistActionResult> {
  const parsed = mergeWishlistSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Your request could not be read." }
  }

  const user = await resolveDbUser()
  if (!user) {
    return { ok: false, error: "Sign in to save pieces." }
  }
  const allowed = await rateLimitKey("wishlist:merge:user", user.id, 10, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  const items = await mergeWishlist(user.id, parsed.data.productSlugs)
  return { ok: true, items }
}

export async function clearWishlistAction(): Promise<WishlistActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to clear saved pieces." }
  const allowed = await rateLimitKey("wishlist:clear:user", user.id, 20, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }
  const items = await clearWishlist(user.id)
  return { ok: true, items }
}
