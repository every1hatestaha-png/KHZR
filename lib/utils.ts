import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCIES: Record<string, { locale: string; symbol: string }> = {
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
}

export function formatMoney(
  amount: number | string,
  currency: string = "USD",
  opts?: { withSymbol?: boolean; compact?: boolean }
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount
  const { locale, symbol } = CURRENCIES[currency] ?? CURRENCIES.USD
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)

  if (opts?.withSymbol === false) {
    return formatted.replace(symbol, "").trim()
  }
  return formatted
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatDate(input: string | Date, locale = "en-US") {
  const date = typeof input === "string" ? new Date(input) : input
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function initials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "KZ"
}

export function clampText(value: string, max = 160) {
  if (value.length <= max) return value
  return `${value.slice(0, max).trimEnd()}…`
}
