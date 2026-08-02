CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

ALTER TABLE "products" ADD COLUMN "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "reviews" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "reviews" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN "helpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "reviews" ADD COLUMN "adminReply" TEXT;
ALTER TABLE "reviews" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "reviews" SET "status" = CASE WHEN "isApproved" = true THEN 'APPROVED'::"ReviewStatus" ELSE 'PENDING'::"ReviewStatus" END;
UPDATE "reviews" SET "approvedAt" = "createdAt" WHERE "isApproved" = true AND "approvedAt" IS NULL;

CREATE TABLE "review_images" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON "reviews"("userId", "productId");
CREATE INDEX "reviews_productId_status_idx" ON "reviews"("productId", "status");
CREATE INDEX "review_images_reviewId_idx" ON "review_images"("reviewId");
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "products" p SET
  "averageRating" = COALESCE(r.avg_rating, 0),
  "reviewCount" = COALESCE(r.review_count, 0)
FROM (
  SELECT "productId", ROUND(AVG("rating")::numeric, 2) AS avg_rating, COUNT(*)::int AS review_count
  FROM "reviews"
  WHERE "status" = 'APPROVED'
  GROUP BY "productId"
) r
WHERE p."id" = r."productId";
