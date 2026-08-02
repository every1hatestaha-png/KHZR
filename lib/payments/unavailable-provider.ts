import { unavailableMessage } from "@/lib/payments/config"
import type {
  NormalizedProviderResponse,
  PaymentCreateResult,
  PaymentProviderAdapter,
  PaymentProviderName,
  PaymentVerificationResult,
} from "@/lib/payments/types"

export function createUnavailableProvider(name: PaymentProviderName): PaymentProviderAdapter {
  return {
    name,
    async createPayment(): Promise<PaymentCreateResult> {
      return { ok: false, error: unavailableMessage(), configurationError: true }
    },
    async verifyCallback(): Promise<PaymentVerificationResult> {
      return { ok: false, error: "Payment callback verification is not configured." }
    },
    async queryPaymentStatus(): Promise<PaymentVerificationResult> {
      return { ok: false, error: "Payment status query is not configured." }
    },
    normalizeProviderResponse(payload: unknown): NormalizedProviderResponse {
      return {
        provider: name,
        safeSummary:
          payload && typeof payload === "object"
            ? Object.fromEntries(
                Object.keys(payload as Record<string, unknown>)
                  .filter((key) => !/password|salt|secret|hash|signature/i.test(key))
                  .map((key) => [key, String((payload as Record<string, unknown>)[key] ?? "")])
              )
            : {},
      }
    },
    async expireOrCancelPayment(): Promise<boolean> {
      return false
    },
  }
}
