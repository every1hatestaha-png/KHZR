import { handlePaymentCallback } from "@/lib/payments/callback-handler"

export const runtime = "nodejs"

export async function POST(request: Request) {
  return handlePaymentCallback("jazzcash", request)
}

export async function GET(request: Request) {
  return handlePaymentCallback("jazzcash", request)
}
