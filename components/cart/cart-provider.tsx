"use client"

import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  addItemAction,
  getCartAction,
  removeItemAction,
  updateQuantityAction,
} from "@/lib/actions/cart-actions"
import { emptyCart } from "@/types"
import type { CartState, ProductSummary } from "@/types"
import { cn } from "@/lib/utils"

type CartContextValue = {
  cart: CartState
  isOpen: boolean
  hydrated: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: ProductSummary, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
}

const CartContext = React.createContext<CartContextValue | null>(null)

function localLineId() {
  return `local-${Math.random().toString(36).slice(2, 10)}`
}

export function CartProvider({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [cart, setCart] = useState<CartState>(emptyCart())
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

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
          return {
            ...prev,
            lines: prev.lines.map((l) =>
              l.variantId === product.variantId
                ? {
                    ...l,
                    quantity: Math.min(
                      Math.max(product.available, 1),
                      l.quantity + qty
                    ),
                  }
                : l
            ),
            count: prev.count + qty,
            subtotal: prev.subtotal + product.unitPrice * qty,
          }
        }
        const line = {
          id: localLineId(),
          variantId: product.variantId,
          productId: product.productId,
          productSlug: product.productSlug,
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
        toast.error(res.error ?? "Could not add to your selection.")
      } else {
        applyServer(res.cart)
        setIsOpen(true)
      }
    },
    [applyServer]
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
      if (!res.ok) toast.error(res.error ?? "Could not update quantity.")
      else applyServer(res.cart)
    },
    [applyServer]
  )

  const removeItem = useCallback(
    async (lineId: string) => {
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
      if (!res.ok) toast.error(res.error ?? "Could not remove this item.")
      else applyServer(res.cart)
    },
    [applyServer]
  )

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      hydrated,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
    }),
    [cart, isOpen, hydrated, addItem, updateQuantity, removeItem]
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
