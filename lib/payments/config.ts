import type { PaymentProviderName } from "@/lib/payments/types"

export function walletProviderConfigured(provider: PaymentProviderName): boolean {
  if (provider === "easypaisa") {
    return Boolean(
      process.env.EASYPAISA_ENV &&
        process.env.EASYPAISA_MERCHANT_ID &&
        process.env.EASYPAISA_STORE_ID &&
        process.env.EASYPAISA_USERNAME &&
        process.env.EASYPAISA_PASSWORD &&
        process.env.EASYPAISA_INTEGRITY_SALT &&
        process.env.EASYPAISA_RETURN_URL
    )
  }
  return Boolean(
    process.env.JAZZCASH_ENV &&
      process.env.JAZZCASH_MERCHANT_ID &&
      process.env.JAZZCASH_PASSWORD &&
      process.env.JAZZCASH_INTEGRITY_SALT &&
      process.env.JAZZCASH_RETURN_URL
  )
}

export function unavailableMessage() {
  return "This payment method is temporarily unavailable."
}
