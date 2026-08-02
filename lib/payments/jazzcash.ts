import { createUnavailableProvider } from "@/lib/payments/unavailable-provider"

// Official JazzCash Payment Gateway v4.2 hash and callback details must be used
// before enabling this adapter. It intentionally fails closed instead of guessing.
export const jazzcashProvider = createUnavailableProvider("jazzcash")
