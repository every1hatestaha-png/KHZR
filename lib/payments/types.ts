export type PaymentProviderName = "easypaisa" | "jazzcash"

export type PaymentCreateInput = {
  orderNumber: string
  amount: number
  currency: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  returnUrl: string
  callbackUrl: string
}

export type PaymentCreateResult =
  | {
      ok: true
      redirectUrl: string
      providerTransactionId: string
      providerReference: string
      providerResponseCode?: string | null
      providerResponseMessage?: string | null
    }
  | { ok: false; error: string; configurationError?: boolean }

export type PaymentVerificationResult =
  | {
      ok: true
      orderNumber: string
      amount: number
      currency: string
      paid: boolean
      failed: boolean
      cancelled: boolean
      providerTransactionId?: string | null
      providerReference?: string | null
      providerResponseCode?: string | null
      providerResponseMessage?: string | null
    }
  | { ok: false; error: string }

export type NormalizedProviderResponse = {
  provider: PaymentProviderName
  safeSummary: Record<string, string>
}

export type PaymentProviderAdapter = {
  name: PaymentProviderName
  createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult>
  verifyCallback(payload: unknown): Promise<PaymentVerificationResult>
  queryPaymentStatus(input: { orderNumber: string; providerTransactionId?: string | null }): Promise<PaymentVerificationResult>
  normalizeProviderResponse(payload: unknown): NormalizedProviderResponse
  expireOrCancelPayment(input: { orderNumber: string; providerTransactionId?: string | null }): Promise<boolean>
}
