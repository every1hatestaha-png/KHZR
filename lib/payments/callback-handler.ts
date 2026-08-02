import { NextResponse } from "next/server"
import { getPaymentProvider } from "@/lib/payments"
import type { PaymentProviderName } from "@/lib/payments/types"
import {
  markWalletOrderFailed,
  markWalletOrderPaidAndDecrementInventory,
} from "@/lib/services/order-service"

async function requestPayload(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return request.json()
  const form = await request.formData().catch(() => null)
  if (form) return Object.fromEntries(form.entries())
  return Object.fromEntries(new URL(request.url).searchParams.entries())
}

export async function handlePaymentCallback(
  providerName: PaymentProviderName,
  request: Request
) {
  const provider = getPaymentProvider(providerName)
  const payload = await requestPayload(request)
  const verified = await provider.verifyCallback(payload)

  if (!verified.ok) {
    console.error(`[payments:${providerName}] callback rejected:`, verified.error)
    return NextResponse.json({ received: false }, { status: 400 })
  }

  if (verified.paid) {
    await markWalletOrderPaidAndDecrementInventory({
      orderNumber: verified.orderNumber,
      providerTransactionId: verified.providerTransactionId,
      providerReference: verified.providerReference,
      providerResponseCode: verified.providerResponseCode,
      providerResponseMessage: verified.providerResponseMessage,
    })
  } else if (verified.failed || verified.cancelled) {
    await markWalletOrderFailed({
      orderNumber: verified.orderNumber,
      cancelled: verified.cancelled,
      providerTransactionId: verified.providerTransactionId,
      providerReference: verified.providerReference,
      providerResponseCode: verified.providerResponseCode,
      providerResponseMessage: verified.providerResponseMessage,
    })
  }

  return NextResponse.json({ received: true })
}
