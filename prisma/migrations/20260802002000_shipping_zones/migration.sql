ALTER TABLE "orders" ADD COLUMN "shippingZone" TEXT;
ALTER TABLE "orders" ADD COLUMN "freeShippingApplied" BOOLEAN NOT NULL DEFAULT false;

ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'PKR';

CREATE TABLE "shipping_zones" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "province" TEXT NOT NULL,
  "cityMatch" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "freeShippingThreshold" DECIMAL(10,2) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_zones_name_key" ON "shipping_zones"("name");
CREATE INDEX "shipping_zones_province_cityMatch_active_idx" ON "shipping_zones"("province", "cityMatch", "active");

INSERT INTO "shipping_zones" ("id", "name", "province", "cityMatch", "amount", "freeShippingThreshold", "active", "createdAt", "updatedAt") VALUES
  ('shipping_lahore', 'Lahore', 'punjab', 'lahore', 200, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_punjab', 'Punjab, excluding Lahore', 'punjab', NULL, 250, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_islamabad', 'Islamabad', 'islamabad', NULL, 250, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_sindh', 'Sindh', 'sindh', NULL, 300, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_kpk', 'Khyber Pakhtunkhwa', 'khyber pakhtunkhwa', NULL, 300, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_balochistan', 'Balochistan', 'balochistan', NULL, 400, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_ajk', 'Azad Jammu and Kashmir', 'azad jammu and kashmir', NULL, 400, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipping_gb', 'Gilgit-Baltistan', 'gilgit-baltistan', NULL, 450, 6000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
