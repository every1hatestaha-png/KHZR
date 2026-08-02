ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "addresses" ADD COLUMN "phone" TEXT;
ALTER TABLE "addresses" ADD COLUMN "area" TEXT;
ALTER TABLE "addresses" ADD COLUMN "deliveryNotes" TEXT;
