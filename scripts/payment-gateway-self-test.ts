import assert from "node:assert/strict"
import { easypaisaProvider } from "../lib/payments/easypaisa"
import { jazzcashProvider } from "../lib/payments/jazzcash"

const basePayment = {
  orderNumber: "KHZR-TEST123",
  amount: 6200,
  currency: "PKR",
  customerName: "Test Customer",
  customerPhone: "03000000000",
  customerEmail: "test@example.com",
  returnUrl: "https://example.com/checkout/success",
  callbackUrl: "https://example.com/api/payments/callback",
}

async function run() {
  for (const provider of [easypaisaProvider, jazzcashProvider]) {
    const create = await provider.createPayment(basePayment)
    assert.equal(create.ok, false, `${provider.name} must not initiate without documented configuration`)
    if (!create.ok) {
      assert.equal(create.error, "This payment method is temporarily unavailable.")
      assert.equal(create.configurationError, true)
    }

    const invalid = await provider.verifyCallback({ orderNumber: basePayment.orderNumber })
    assert.equal(invalid.ok, false, `${provider.name} must reject unverified callbacks`)

    const duplicate = await provider.verifyCallback({ orderNumber: basePayment.orderNumber })
    assert.equal(duplicate.ok, false, `${provider.name} duplicate unverified callback must not succeed`)

    const failed = await provider.queryPaymentStatus({ orderNumber: basePayment.orderNumber })
    assert.equal(failed.ok, false, `${provider.name} status query must fail closed until implemented`)

    const cancelled = await provider.expireOrCancelPayment({ orderNumber: basePayment.orderNumber })
    assert.equal(cancelled, false, `${provider.name} cancellation is unsupported until implemented`)
  }

  console.log("Payment gateway foundation self-test passed")
}

run()
