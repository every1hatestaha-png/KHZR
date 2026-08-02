"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ClerkAuth, clerkEnabled } from "@/components/providers/clerk-auth"
import {
  clearWishlistAction,
  getWishlistAction,
  mergeWishlistAction,
  toggleWishlistAction,
} from "@/lib/actions/wishlist-actions"
import type { ProductSummary } from "@/types"
import { analytics, productToAnalyticsItem } from "@/lib/analytics"

const STORAGE_KEY = "khzr_wishlist"

type WishlistContextValue = {
  items: ProductSummary[]
  ids: string[]
  count: number
  hydrated: boolean
  isSignedIn: boolean
  isInWishlist: (productSlug: string) => boolean
  toggle: (item: ProductSummary) => Promise<void>
  remove: (item: ProductSummary) => Promise<void>
  clear: () => Promise<void>
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null)

type WishlistProviderProps = {
  children: React.ReactNode
  clerkUserId?: string | null
}

export function WishlistProvider(props: WishlistProviderProps) {
  if (clerkEnabled) {
    return (
      <ClerkAuth>
        {(userId) => <WishlistProviderCore {...props} clerkUserId={userId} />}
      </ClerkAuth>
    )
  }
  return <WishlistProviderCore {...props} clerkUserId={null} />
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

function WishlistProviderCore({
  children,
  clerkUserId,
}: WishlistProviderProps) {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [hydrated, setHydrated] = useState(false)
  const signedIn = clerkUserId !== null

  useEffect(() => {
    let cancelled = false

    async function sync() {
      if (signedIn) {
        const guest = readGuest()
        if (guest.length > 0) {
          const merged = await mergeWishlistAction(
            guest.map((g) => g.productSlug)
          )
          if (!cancelled && merged.ok) {
            writeGuest([])
            setItems(merged.items ?? guest)
            setHydrated(true)
            toast.success("Your saved pieces are now in your account.")
            return
          }
        }
        const res = await getWishlistAction()
        if (!cancelled) {
          setItems(res.ok ? (res.items ?? []) : [])
          setHydrated(true)
        }
      } else {
        const list = readGuest()
        if (!cancelled) {
          setItems(list)
          setHydrated(true)
        }
      }
    }

    void sync()
    return () => {
      cancelled = true
    }
  }, [signedIn])

  const toggle = useCallback(
    async (item: ProductSummary) => {
      const wasSaved = items.some((i) => i.productSlug === item.productSlug)
      if (signedIn) {
        const res = await toggleWishlistAction({ productSlug: item.productSlug })
        if (!res.ok) {
          toast.error(res.error ?? "Could not update your saved pieces.")
          return
        }
        analytics.wishlist({
          action: wasSaved ? "remove" : "add",
          item: productToAnalyticsItem(item),
          value: item.unitPrice,
          currency: "PKR",
        })
        setItems(res.items ?? [])
      } else {
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
      }
    },
    [items, signedIn]
  )

  const remove = useCallback(
    async (item: ProductSummary) => {
      const exists = items.some((i) => i.productSlug === item.productSlug)
      if (!exists) return
      await toggle(item)
    },
    [items, toggle]
  )

  const clear = useCallback(async () => {
    if (signedIn) {
      const res = await clearWishlistAction()
      if (!res.ok) {
        toast.error(res.error ?? "Could not clear your saved pieces.")
        return
      }
      setItems(res.items ?? [])
    } else {
      writeGuest([])
      setItems([])
    }
  }, [signedIn])

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
      isSignedIn: signedIn,
      isInWishlist,
      toggle,
      remove,
      clear,
    }),
    [items, ids, count, hydrated, signedIn, isInWishlist, toggle, remove, clear]
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
