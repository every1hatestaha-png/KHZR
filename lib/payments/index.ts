import { easypaisaProvider } from "@/lib/payments/easypaisa"
import { jazzcashProvider } from "@/lib/payments/jazzcash"
import type { PaymentProviderAdapter, PaymentProviderName } from "@/lib/payments/types"

export function getPaymentProvider(name: PaymentProviderName): PaymentProviderAdapter {
  return name === "easypaisa" ? easypaisaProvider : jazzcashProvider
}
