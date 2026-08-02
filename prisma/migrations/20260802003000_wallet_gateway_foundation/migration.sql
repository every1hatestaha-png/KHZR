ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "orders" ADD COLUMN "providerTransactionId" TEXT;
ALTER TABLE "orders" ADD COLUMN "providerReference" TEXT;
ALTER TABLE "orders" ADD COLUMN "providerResponseCode" TEXT;
ALTER TABLE "orders" ADD COLUMN "providerResponseMessage" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentInitiatedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "paymentFailedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "orders_providerTransactionId_key" ON "orders"("providerTransactionId");
