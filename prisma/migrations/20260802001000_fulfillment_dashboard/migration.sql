ALTER TABLE "orders" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "orders" ADD COLUMN "fulfillmentStage" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "orders" ADD COLUMN "courier" TEXT;
ALTER TABLE "orders" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingDate" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "expectedDelivery" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3);

CREATE INDEX "orders_paymentProvider_createdAt_idx" ON "orders"("paymentProvider", "createdAt");
CREATE INDEX "orders_phone_idx" ON "orders"("phone");
