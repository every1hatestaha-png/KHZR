"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { ProductSummary } from "@/types"
import { analytics, productToAnalyticsItem } from "@/lib/analytics"

const STORAGE_KEY = "khzr_wishlist"

type WishlistContextValue = {
  items: ProductSummary[]
  ids: string[]
  count: number
  hydrated: boolean
  isInWishlist: (productSlug: string) => boolean
  toggle: (item: ProductSummary) => Promise<void>
  remove: (item: ProductSummary) => Promise<void>
  clear: () => Promise<void>
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null)

type WishlistProviderProps = {
  children: React.ReactNode
}

export function WishlistProvider(props: WishlistProviderProps) {
  return <WishlistProviderCore {...props} />
}

function readGuest(): ProductSummary[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeGuest(items: ProductSummary[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage unavailable — keep the in-memory list only.
  }
}

function WishlistProviderCore({ children }: WishlistProviderProps) {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const list = readGuest()
    setItems(list)
    setHydrated(true)
  }, [])

  const toggle = useCallback(async (item: ProductSummary) => {
    const wasSaved = items.some((i) => i.productSlug === item.productSlug)
    setItems((prev) => {
      const exists = prev.some((i) => i.productSlug === item.productSlug)
      const next = exists
        ? prev.filter((i) => i.productSlug !== item.productSlug)
        : [...prev, item]
      writeGuest(next)
      return next
    })
    analytics.wishlist({
      action: wasSaved ? "remove" : "add",
      item: productToAnalyticsItem(item),
      value: item.unitPrice,
      currency: "PKR",
    })
  }, [items])

  const remove = useCallback(async (item: ProductSummary) => {
    const exists = items.some((i) => i.productSlug === item.productSlug)
    if (!exists) return
    const next = items.filter((i) => i.productSlug !== item.productSlug)
    writeGuest(next)
    setItems(next)
    analytics.wishlist({
      action: "remove",
      item: productToAnalyticsItem(item),
      value: item.unitPrice,
      currency: "PKR",
    })
    toast.success(`${item.name} removed from your wishlist.`)
  }, [items])

  const clear = useCallback(async () => {
    writeGuest([])
    setItems([])
  }, [])

  const ids = useMemo(() => items.map((i) => i.productSlug), [items])
  const count = useMemo(() => ids.length, [ids])

  const isInWishlist = useCallback(
    (productSlug: string) => ids.includes(productSlug),
    [ids]
  )

  const value = useMemo(
    () => ({
      items,
      ids,
      count,
      hydrated,
      isInWishlist,
      toggle,
      remove,
      clear,
    }),
    [items, ids, count, hydrated, isInWishlist, toggle, remove, clear]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
