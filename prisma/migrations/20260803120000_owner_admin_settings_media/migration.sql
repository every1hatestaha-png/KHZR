CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "storeName" TEXT NOT NULL DEFAULT 'KHZR',
    "ownerNotificationEmail" TEXT,
    "customerSupportEmail" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "contactDetails" TEXT,
    "returnPolicyText" TEXT,
    "shippingPolicyText" TEXT,
    "footerLinks" JSONB,
    "announcementText" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "heroImageUrl" TEXT,
    "heroLabel" TEXT,
    "heroHeading" TEXT,
    "heroDescription" TEXT,
    "heroButtonText" TEXT,
    "heroButtonLink" TEXT,
    "homepageCategoryLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "alt" TEXT,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_assets_url_key" ON "media_assets"("url");
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt");
