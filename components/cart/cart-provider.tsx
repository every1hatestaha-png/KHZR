"use client"

import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  addItemAction,
  clearCartAction,
  getCartAction,
  removeItemAction,
  updateQuantityAction,
} from "@/lib/actions/cart-actions"
import { applyDiscountCode } from "@/lib/discounts"
import { emptyCart } from "@/types"
import type { CartState, Discount, ProductSummary } from "@/types"
import { analytics, cartLineToAnalyticsItem, productToAnalyticsItem } from "@/lib/analytics"
import { cn } from "@/lib/utils"

type CartContextValue = {
  cart: CartState
  isOpen: boolean
  hydrated: boolean
  discount: Discount | null
  openCart: () => void
  closeCart: () => void
  addItem: (product: ProductSummary, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  clearCart: () => Promise<void>
  applyDiscount: (code: string) => boolean
  clearDiscount: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

function localLineId() {
  return `local-${Math.random().toString(36).slice(2, 10)}`
}

type CartProviderProps = {
  children: React.ReactNode
  className?: string
}

export function CartProvider(props: CartProviderProps) {
  return <CartProviderCore {...props} />
}

function CartProviderCore({
  children,
  className,
}: CartProviderProps) {
  const [cart, setCart] = useState<CartState>(emptyCart())
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [discount, setDiscount] = useState<Discount | null>(null)

  const applyServer = useCallback((next: CartState | null) => {
    if (next) setCart(next)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    getCartAction()
      .then((res) => {
        if (!cancelled && res.cart) setCart(res.cart)
      })
      .finally(() => {
        if (!cancelled) setHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addItem = useCallback(
    async (product: ProductSummary, quantity = 1) => {
      const qty = Math.max(1, Math.floor(quantity))
      setCart((prev) => {
        const existing = prev.lines.find(
          (l) => l.variantId === product.variantId
        )
        if (existing) {
          const nextQuantity = Math.min(
            Math.max(product.available, 1),
            existing.quantity + qty
          )
          const delta = nextQuantity - existing.quantity
          return {
            ...prev,
            lines: prev.lines.map((l) =>
              l.variantId === product.variantId
                ? { ...l, quantity: nextQuantity }
                : l
            ),
            count: prev.count + delta,
            subtotal: prev.subtotal + product.unitPrice * delta,
          }
        }
        const line = {
          id: localLineId(),
          variantId: product.variantId,
          productId: product.productId,
          productSlug: product.productSlug,
          sku: "",
          name: product.name,
          subtitle: product.subtitle,
          size: product.size,
          color: product.color,
          colorHex: product.colorHex,
          imageUrl: product.imageUrl,
          unitPrice: product.unitPrice,
          quantity: qty,
          available: product.available,
        }
        return {
          ...prev,
          lines: [...prev.lines, line],
          count: prev.count + qty,
          subtotal: prev.subtotal + product.unitPrice * qty,
        }
      })

      const res = await addItemAction({
        variantId: product.variantId,
        quantity: qty,
      })
      if (!res.ok) {
        applyServer(res.cart)
        toast.error(res.error ?? "Could not add to your selection.")
      } else {
        analytics.addToCart({
          item: productToAnalyticsItem(product, qty),
          value: product.unitPrice * qty,
          currency: cart.currency,
        })
        applyServer(res.cart)
        setIsOpen(true)
      }
    },
    [applyServer, cart.currency]
  )

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      setCart((prev) => {
        const line = prev.lines.find((l) => l.id === lineId)
        if (!line) return prev
        if (quantity <= 0) {
          return {
            ...prev,
            lines: prev.lines.filter((l) => l.id !== lineId),
            count: prev.count - line.quantity,
            subtotal: prev.subtotal - line.unitPrice * line.quantity,
          }
        }
        return {
          ...prev,
          lines: prev.lines.map((l) =>
            l.id === lineId
              ? { ...l, quantity: Math.min(10, quantity) }
              : l
          ),
          count: prev.count + (quantity - line.quantity),
          subtotal:
            prev.subtotal + (quantity - line.quantity) * line.unitPrice,
        }
      })

      const res = await updateQuantityAction({ lineId, quantity })
      if (!res.ok) {
        applyServer(res.cart)
        toast.error(res.error ?? "Could not update quantity.")
      } else applyServer(res.cart)
    },
    [applyServer]
  )

  const removeItem = useCallback(
    async (lineId: string) => {
      const previous = cart
      const removed = cart.lines.find((l) => l.id === lineId)
      setCart((prev) => {
        const line = prev.lines.find((l) => l.id === lineId)
        if (!line) return prev
        return {
          ...prev,
          lines: prev.lines.filter((l) => l.id !== lineId),
          count: prev.count - line.quantity,
          subtotal: prev.subtotal - line.unitPrice * line.quantity,
        }
      })

      const res = await removeItemAction({ lineId })
      if (!res.ok) {
        setCart(previous)
        toast.error(res.error ?? "Could not remove this item.")
      }
      else {
        if (removed) {
          analytics.removeFromCart({
            item: cartLineToAnalyticsItem(removed),
            value: removed.unitPrice * removed.quantity,
            currency: cart.currency,
          })
        }
        applyServer(res.cart)
        toast.success(removed ? `${removed.name} removed from your bag.` : "Item removed from your bag.")
      }
    },
    [applyServer, cart]
  )

  const clearCart = useCallback(async () => {
    setCart(emptyCart())
    const res = await clearCartAction()
    if (res.ok && res.cart) {
      setCart(res.cart)
    } else if (res.ok) {
      toast.success("Your selection has been cleared.")
    } else {
      toast.error(res.error ?? "Could not clear your selection.")
    }
    setDiscount(null)
  }, [])

  const applyDiscount = useCallback((code: string) => {
    const applied = applyDiscountCode(code)
    if (!applied) {
      toast.error("That code isn't recognised.")
      return false
    }
    setDiscount(applied)
    toast.success("Code applied.")
    return true
  }, [])

  const clearDiscount = useCallback(() => {
    setDiscount(null)
  }, [])

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      hydrated,
      discount,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyDiscount,
      clearDiscount,
    }),
    [
      cart,
      isOpen,
      hydrated,
      discount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyDiscount,
      clearDiscount,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      <div className={cn(className)}>{children}</div>
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
