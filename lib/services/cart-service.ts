import "server-only"

import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { CART_TTL_DAYS } from "@/lib/constants"
import { emptyCart } from "@/types"
import type { CartLine, CartState } from "@/types"

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

function toNumber(value: { toString(): string }) {
  return Number(value.toString())
}

function toLine(item: {
  id: string
  quantity: number
  variant: {
    id: string
    sku: string
    size: string
    color: string
    colorHex: string | null
    stock: number
    product: {
      id: string
      slug: string
      name: string
      subtitle: string | null
      price: { toString(): string }
      currency: string
      media: { url: string }[]
    }
  }
}): CartLine {
  return {
    id: item.id,
    variantId: item.variant.id,
    productId: item.variant.product.id,
    productSlug: item.variant.product.slug,
    sku: item.variant.sku,
    name: item.variant.product.name,
    subtitle: item.variant.product.subtitle,
    size: item.variant.size,
    color: item.variant.color,
    colorHex: item.variant.colorHex,
    imageUrl: item.variant.product.media[0]?.url ?? null,
    unitPrice: toNumber(item.variant.product.price),
    quantity: item.quantity,
    available: Math.max(0, item.variant.stock),
  }
}

function toState(items: Array<Parameters<typeof toLine>[0]>): CartState {
  const lines = items.map(toLine)
  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce(
      (n, l) => n + l.unitPrice * l.quantity,
      0
    ),
    currency: lines[0] ? "PKR" : "PKR",
  }
}

/** Reads the persisted cart for a token, or an empty cart. */
export async function getCartState(token: string | null): Promise<CartState> {
  if (!isDatabaseConfigured() || !token) return emptyCart()

  const cart = await prisma.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  subtitle: true,
                  price: true,
                  currency: true,
                  media: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!cart) return emptyCart()
  return toState(cart.items)
}

/** Ensures a cart row exists for the token; creates one if missing. */
export async function ensureCartToken(
  token: string | null,
  userId?: string | null
): Promise<string | null> {
  if (!isDatabaseConfigured()) return null

  if (!token) {
    token = randomUUID()
    await prisma.cart.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + CART_TTL_DAYS * 86_400_000),
        ...(userId ? { userId } : {}),
      },
    })
    return token
  }

  const existing = await prisma.cart.findUnique({ where: { token } })
  if (!existing) {
    await prisma.cart.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + CART_TTL_DAYS * 86_400_000),
        ...(userId ? { userId } : {}),
      },
    })
  } else if (userId && !existing.userId) {
    await prisma.cart.update({
      where: { id: existing.id },
      data: { userId },
    })
  }
  return token
}

/**
 * Resolves the effective cart for a signed-in user: links an anonymous token
 * cart to the user, or merges it into their existing account cart.
 * Returns the token the cookie should hold, or null when untouched.
 */
export async function resolveCartForUser(
  clerkId: string,
  token: string | null
): Promise<{ token: string } | null> {
  if (!isDatabaseConfigured()) return null

  const userCart = await prisma.cart.findUnique({ where: { userId: clerkId } })
  const tokenCart = token
    ? await prisma.cart.findUnique({ where: { token } })
    : null

  if (tokenCart && !userCart) {
    await prisma.cart.update({
      where: { id: tokenCart.id },
      data: { userId: clerkId },
    })
    return { token: tokenCart.token }
  }

  if (tokenCart && userCart && tokenCart.id !== userCart.id) {
    await mergeCarts(userCart.id, tokenCart.id)
    return { token: userCart.token }
  }

  if (userCart) return { token: userCart.token }
  return null
}

/** Moves every line from the source cart into the target, then deletes the source. */
async function mergeCarts(targetId: string, sourceId: string) {
  const [targetItems, sourceItems] = await Promise.all([
    prisma.cartItem.findMany({ where: { cartId: targetId } }),
    prisma.cartItem.findMany({ where: { cartId: sourceId } }),
  ])

  const targetByVariant = new Map(
    targetItems.map((item) => [item.variantId, item])
  )

  await prisma.$transaction([
    ...sourceItems.map((item) => {
      const existing = targetByVariant.get(item.variantId)
      if (existing) {
        return prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(10, existing.quantity + item.quantity) },
        })
      }
      return prisma.cartItem.create({
        data: {
          cartId: targetId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      })
    }),
    prisma.cart.delete({ where: { id: sourceId } }),
  ])
}

/** Adds a variant to the cart, merging same-variant lines. */
export async function addToCart(token: string, input: {
  variantId: string
  quantity: number
}): Promise<CartState> {
  if (!isDatabaseConfigured()) return emptyCart()

  const cart = await prisma.cart.findUnique({ where: { token } })
  if (!cart) return emptyCart()

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: { cartId: cart.id, variantId: input.variantId },
    },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(10, existing.quantity + input.quantity) },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: input.variantId,
        quantity: input.quantity,
      },
    })
  }

  return getCartState(token)
}

export async function updateCartQuantity(
  token: string,
  lineId: string,
  quantity: number
): Promise<CartState> {
  if (!isDatabaseConfigured()) return emptyCart()

  const cart = await prisma.cart.findUnique({ where: { token } })
  if (!cart) return emptyCart()

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: lineId, cartId: cart.id } })
  } else {
    await prisma.cartItem.updateMany({
      where: { id: lineId, cartId: cart.id },
      data: { quantity: Math.min(10, quantity) },
    })
  }
  return getCartState(token)
}

export async function removeCartItem(
  token: string,
  lineId: string
): Promise<CartState> {
  if (!isDatabaseConfigured()) return emptyCart()
  const cart = await prisma.cart.findUnique({ where: { token } })
  if (!cart) return emptyCart()
  await prisma.cartItem.deleteMany({ where: { id: lineId, cartId: cart.id } })
  return getCartState(token)
}

export async function clearCart(token: string): Promise<CartState> {
  if (!isDatabaseConfigured()) return emptyCart()
  const cart = await prisma.cart.findUnique({ where: { token } })
  if (!cart) return emptyCart()
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  return emptyCart()
}
