import { createHash } from "node:crypto"
import { normalizePakistanMobile } from "@/lib/pakistan-phone"

export { normalizePakistanMobile }

const PLACEHOLDER_VALUES = new Set([
  "test",
  "testing",
  "asdf",
  "qwerty",
  "abc",
  "abcd",
  "abc123",
  "n/a",
  "na",
  "none",
  "null",
  "unknown",
  "address",
  "street",
  "house",
  "home",
])

function compact(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function isPlaceholder(value: string) {
  const normalized = compact(value)
  return PLACEHOLDER_VALUES.has(normalized) || /^([a-z])\1{2,}$/.test(normalized)
}

export function validateCheckoutAddress(input: {
  firstName: string
  lastName: string
  city: string
  area: string
  streetAddress: string
  houseApartment: string
}): string | null {
  const fields = [
    input.firstName,
    input.lastName,
    input.city,
    input.area,
    input.streetAddress,
    input.houseApartment,
  ]
  if (fields.some(isPlaceholder)) return "Enter complete delivery details, not placeholder text."
  if (input.streetAddress.trim().length < 8) return "Enter a complete street address."
  if (input.houseApartment.trim().length < 2) return "Enter your house or apartment details."
  return null
}

export function maskPhone(value: string | null | undefined): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, "")
  if (digits.length <= 4) return "****"
  return `${digits.slice(0, 3)}****${digits.slice(-2)}`
}

export function maskEmail(value: string | null | undefined): string | null {
  if (!value) return null
  const [name, domain] = value.split("@")
  if (!domain) return "***"
  return `${name.slice(0, 2)}***@${domain}`
}

export function fingerprintValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12)
}

export function logCheckoutEvent(event: string, data: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ scope: "checkout", event, ...data }))
}
