/**
 * Client-safe Pakistan mobile number utilities. Pure and dependency-free so
 * the same source of truth can be used from server validations and from
 * client components.
 */

/** Normalizes a Pakistan mobile number to 03XXXXXXXXX, or null when invalid. */
export function normalizePakistanMobile(value: string): string | null {
  const digits = value.replace(/\D/g, "")
  const normalized = digits.startsWith("0092")
    ? `0${digits.slice(4)}`
    : digits.startsWith("92")
      ? `0${digits.slice(2)}`
      : digits.startsWith("3") && digits.length === 10
        ? `0${digits}`
        : digits
  return /^03\d{9}$/.test(normalized) ? normalized : null
}
