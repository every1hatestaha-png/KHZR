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
    currency: lines[0] ? "USD" : "USD",
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
  token: string | null
): Promise<string | null> {
  if (!isDatabaseConfigured()) return null

  if (!token) {
    token = randomUUID()
    await prisma.cart.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + CART_TTL_DAYS * 86_400_000),
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
      },
    })
  }
  return token
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
