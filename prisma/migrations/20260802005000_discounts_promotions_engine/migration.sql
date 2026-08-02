CREATE TYPE "PromotionTrigger" AS ENUM ('COUPON', 'AUTOMATIC');
CREATE TYPE "PromotionScope" AS ENUM ('STORE', 'PRODUCTS', 'COLLECTIONS');
CREATE TYPE "PromotionDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

CREATE TABLE "promotions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "trigger" "PromotionTrigger" NOT NULL DEFAULT 'COUPON',
  "scope" "PromotionScope" NOT NULL DEFAULT 'STORE',
  "discountType" "PromotionDiscountType" NOT NULL,
  "percentage" DECIMAL(5,2),
  "amount" DECIMAL(10,2),
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "maxUses" INTEGER,
  "usesPerCustomer" INTEGER,
  "minimumOrderValue" DECIMAL(10,2),
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promotion_products" (
  "promotionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("promotionId", "productId")
);

CREATE TABLE "promotion_collections" (
  "promotionId" TEXT NOT NULL,
  "collectionId" TEXT NOT NULL,
  CONSTRAINT "promotion_collections_pkey" PRIMARY KEY ("promotionId", "collectionId")
);

CREATE TABLE "promotion_redemptions" (
  "id" TEXT NOT NULL,
  "promotionId" TEXT NOT NULL,
  "orderId" TEXT,
  "userId" TEXT,
  "email" TEXT,
  "couponCode" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders" ADD COLUMN "promotionId" TEXT;
ALTER TABLE "orders" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "orders" ADD COLUMN "promotionType" TEXT;

CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");
CREATE INDEX "promotions_active_trigger_idx" ON "promotions"("active", "trigger");
CREATE INDEX "promotions_code_idx" ON "promotions"("code");
CREATE INDEX "orders_promotionId_idx" ON "orders"("promotionId");
CREATE INDEX "promotion_redemptions_promotionId_userId_idx" ON "promotion_redemptions"("promotionId", "userId");
CREATE INDEX "promotion_redemptions_promotionId_email_idx" ON "promotion_redemptions"("promotionId", "email");

ALTER TABLE "orders" ADD CONSTRAINT "orders_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_collections" ADD CONSTRAINT "promotion_collections_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_collections" ADD CONSTRAINT "promotion_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
