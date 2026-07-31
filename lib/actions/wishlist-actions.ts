"use server"

import { resolveDbUser } from "@/lib/services/user-service"
import {
  getWishlist,
  mergeWishlist,
  toggleWishlist,
} from "@/lib/services/wishlist-service"
import {
  mergeWishlistSchema,
  toggleWishlistSchema,
} from "@/lib/validations/wishlist"
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

  const items = await mergeWishlist(user.id, parsed.data.productSlugs)
  return { ok: true, items }
}
