import { roundMoney } from "@/lib/services/pricing-service"

export type ShippingQuote = {
  zoneName: string
  shipping: number
  baseRate: number
  freeShippingThreshold: number
  freeShippingApplied: boolean
}

export type ShippingZoneLike = {
  name: string
  province: string
  cityMatch: string | null
  amount: unknown
  freeShippingThreshold: unknown
  active: boolean
}

export const DEFAULT_SHIPPING_ZONES = [
  { name: "Lahore", province: "punjab", cityMatch: "lahore", amount: 200, freeShippingThreshold: 6000, active: true },
  { name: "Punjab, excluding Lahore", province: "punjab", cityMatch: null, amount: 250, freeShippingThreshold: 6000, active: true },
  { name: "Islamabad", province: "islamabad", cityMatch: null, amount: 250, freeShippingThreshold: 6000, active: true },
  { name: "Sindh", province: "sindh", cityMatch: null, amount: 300, freeShippingThreshold: 6000, active: true },
  { name: "Khyber Pakhtunkhwa", province: "khyber pakhtunkhwa", cityMatch: null, amount: 300, freeShippingThreshold: 6000, active: true },
  { name: "Balochistan", province: "balochistan", cityMatch: null, amount: 400, freeShippingThreshold: 6000, active: true },
  { name: "Azad Jammu and Kashmir", province: "azad jammu and kashmir", cityMatch: null, amount: 400, freeShippingThreshold: 6000, active: true },
  { name: "Gilgit-Baltistan", province: "gilgit-baltistan", cityMatch: null, amount: 450, freeShippingThreshold: 6000, active: true },
] as const

export function normalizeLocation(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function provinceAliases(value: string): string {
  const normalized = normalizeLocation(value)
  if (["ict", "islamabad capital territory", "islamabad"].includes(normalized)) return "islamabad"
  if (["kpk", "kp", "khyber-pakhtunkhwa", "khyber pakhtunkhwa"].includes(normalized)) return "khyber pakhtunkhwa"
  if (["ajk", "azad kashmir", "azad jammu & kashmir", "azad jammu and kashmir"].includes(normalized)) return "azad jammu and kashmir"
  if (["gb", "gilgit baltistan", "gilgit-baltistan"].includes(normalized)) return "gilgit-baltistan"
  return normalized
}

export function quoteShippingFromZones(
  zones: ShippingZoneLike[],
  { province, city, subtotal }: { province: string; city: string; subtotal: number }
): ShippingQuote {
  const normalizedProvince = provinceAliases(province)
  const normalizedCity = normalizeLocation(city)
  if (!normalizedProvince || !normalizedCity) {
    throw new Error("Enter your province and city to calculate shipping.")
  }

  const activeZones = zones.filter((zone) => zone.active)
  const lahoreMatch = normalizedCity === "lahore"
    ? activeZones.find((zone) => zone.cityMatch && normalizeLocation(zone.cityMatch) === "lahore")
    : null
  if (normalizedCity === "lahore" && !lahoreMatch) {
    throw new Error("Shipping to Lahore is currently unavailable.")
  }
  const cityMatch = activeZones.find(
    (zone) => provinceAliases(zone.province) === normalizedProvince && zone.cityMatch && normalizeLocation(zone.cityMatch) === normalizedCity
  )
  const provinceMatch = activeZones.find(
    (zone) => provinceAliases(zone.province) === normalizedProvince && !zone.cityMatch
  )
  const zone = lahoreMatch ?? cityMatch ?? provinceMatch
  if (!zone) throw new Error("We do not currently deliver to that province or city.")

  const baseRate = Number(zone.amount)
  const freeShippingThreshold = Number(zone.freeShippingThreshold)
  const freeShippingApplied = subtotal >= freeShippingThreshold
  return {
    zoneName: zone.name,
    shipping: freeShippingApplied ? 0 : roundMoney(baseRate),
    baseRate: roundMoney(baseRate),
    freeShippingThreshold: roundMoney(freeShippingThreshold),
    freeShippingApplied,
  }
}
