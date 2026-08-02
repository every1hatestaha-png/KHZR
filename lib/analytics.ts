"use client"

import type { CartLine, ProductSummary } from "@/types"

export type ConsentPreferences = {
  analytics: boolean
  marketing: boolean
}

export type AnalyticsItem = {
  item_id?: string
  item_name: string
  item_variant?: string
  price?: number
  quantity?: number
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export const CONSENT_STORAGE_KEY = "khzr_cookie_consent"

export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
}

export function productToAnalyticsItem(product: ProductSummary, quantity = 1): AnalyticsItem {
  return {
    item_id: product.productSlug,
    item_name: product.name,
    item_variant: [product.color, product.size].filter(Boolean).join(" / "),
    price: product.unitPrice,
    quantity,
  }
}

export function cartLineToAnalyticsItem(line: CartLine): AnalyticsItem {
  return {
    item_id: line.productSlug,
    item_name: line.name,
    item_variant: [line.color, line.size].filter(Boolean).join(" / "),
    price: line.unitPrice,
    quantity: line.quantity,
  }
}

function gaEvent(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsConfig.gaMeasurementId || typeof window === "undefined" || !window.gtag) return
  window.gtag("event", name, params)
}

function metaEvent(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsConfig.metaPixelId || typeof window === "undefined" || !window.fbq) return
  window.fbq("track", name, params)
}

export const analytics = {
  pageView(path: string) {
    if (analyticsConfig.gaMeasurementId && window.gtag) {
      window.gtag("config", analyticsConfig.gaMeasurementId, { page_path: path })
    }
    metaEvent("PageView")
  },
  productViewed(input: { item: AnalyticsItem; value: number; currency: string }) {
    gaEvent("view_item", { currency: input.currency, value: input.value, items: [input.item] })
    metaEvent("ViewContent", { currency: input.currency, value: input.value, content_ids: [input.item.item_id], content_name: input.item.item_name, content_type: "product" })
  },
  collectionViewed(input: { slug: string; name: string }) {
    gaEvent("view_item_list", { item_list_id: input.slug, item_list_name: input.name })
  },
  search(input: { term: string }) {
    gaEvent("search", { search_term: input.term })
  },
  addToCart(input: { item: AnalyticsItem; value: number; currency: string }) {
    gaEvent("add_to_cart", { currency: input.currency, value: input.value, items: [input.item] })
    metaEvent("AddToCart", { currency: input.currency, value: input.value, content_ids: [input.item.item_id], content_name: input.item.item_name, content_type: "product" })
  },
  removeFromCart(input: { item: AnalyticsItem; value: number; currency: string }) {
    gaEvent("remove_from_cart", { currency: input.currency, value: input.value, items: [input.item] })
  },
  wishlist(input: { action: "add" | "remove"; item: AnalyticsItem; value: number; currency: string }) {
    gaEvent(input.action === "add" ? "add_to_wishlist" : "remove_from_wishlist", { currency: input.currency, value: input.value, items: [input.item] })
  },
  beginCheckout(input: { value: number; currency: string; items: AnalyticsItem[] }) {
    gaEvent("begin_checkout", { currency: input.currency, value: input.value, items: input.items })
    metaEvent("InitiateCheckout", { currency: input.currency, value: input.value, num_items: input.items.reduce((n, item) => n + Number(item.quantity ?? 0), 0) })
  },
  purchase(input: { orderNumber: string; value: number; currency: string; shipping: number; discount: number; paymentMethod: string; items: AnalyticsItem[] }) {
    gaEvent("purchase", { transaction_id: input.orderNumber, value: input.value, currency: input.currency, shipping: input.shipping, discount: input.discount, payment_type: input.paymentMethod, items: input.items })
    metaEvent("Purchase", { currency: input.currency, value: input.value, content_ids: input.items.map((item) => item.item_id), content_type: "product" })
  },
  login() {
    gaEvent("login", { method: "Clerk" })
  },
  signUp() {
    gaEvent("sign_up", { method: "Clerk" })
    metaEvent("CompleteRegistration", { content_name: "KHZR Account" })
  },
  productOption(input: { option: "size" | "color" | "gallery_image"; value: string; productSlug: string }) {
    gaEvent("select_item", { item_list_name: input.option, item_id: input.productSlug, value: input.value })
  },
  collectionFilter(input: { type: "filter" | "sort"; value: string; collection?: string }) {
    gaEvent("select_content", { content_type: input.type, item_id: input.collection, value: input.value })
  },
}
