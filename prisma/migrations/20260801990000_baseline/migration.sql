-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('SHIPPING', 'BILLING');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "public"."FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER');

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "public"."AddressType" NOT NULL DEFAULT 'SHIPPING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign_collections" (
    "campaignId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "campaign_collections_pkey" PRIMARY KEY ("campaignId","collectionId")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kicker" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "imageUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "editorial" TEXT,
    "imageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."journal_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lookbook_entries" (
    "id" TEXT NOT NULL,
    "lookbookId" TEXT NOT NULL,
    "productId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lookbook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lookbooks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lookbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "currency" "public"."Currency" NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingTotal" DECIMAL(10,2) NOT NULL,
    "taxTotal" DECIMAL(10,2) NOT NULL,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "customerNotes" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
    "providerSessionId" TEXT,
    "providerPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cartToken" TEXT,
    "fulfillmentStatus" "public"."FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "refundedAt" TIMESTAMP(3),
    "shippingMethod" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_collections" (
    "productId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_collections_pkey" PRIMARY KEY ("productId","collectionId")
);

-- CreateTable
CREATE TABLE "public"."product_media" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "kind" "public"."MediaKind" NOT NULL DEFAULT 'IMAGE',
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "colorHex" TEXT,
    "sku" TEXT NOT NULL,
    "priceOverride" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockAt" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "composition" TEXT,
    "care" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "currency" "public"."Currency" NOT NULL DEFAULT 'USD',
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "stockStatus" "public"."StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "sku" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "public"."addresses"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_variantId_key" ON "public"."cart_items"("cartId" ASC, "variantId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "carts_token_key" ON "public"."carts"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "carts_userId_key" ON "public"."carts"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "public"."collections"("slug" ASC);

-- CreateIndex
CREATE INDEX "journal_posts_publishedAt_idx" ON "public"."journal_posts"("publishedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "journal_posts_slug_key" ON "public"."journal_posts"("slug" ASC);

-- CreateIndex
CREATE INDEX "lookbook_entries_lookbookId_position_idx" ON "public"."lookbook_entries"("lookbookId" ASC, "position" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "lookbooks_slug_key" ON "public"."lookbooks"("slug" ASC);

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "public"."order_items"("orderId" ASC);

-- CreateIndex
CREATE INDEX "orders_cartToken_idx" ON "public"."orders"("cartToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "public"."orders"("orderNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_providerPaymentId_key" ON "public"."orders"("providerPaymentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_providerSessionId_key" ON "public"."orders"("providerSessionId" ASC);

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "public"."orders"("status" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "public"."orders"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "product_collections_collectionId_position_idx" ON "public"."product_collections"("collectionId" ASC, "position" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_media_productId_position_key" ON "public"."product_media"("productId" ASC, "position" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_size_color_key" ON "public"."product_variants"("productId" ASC, "size" ASC, "color" ASC);

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "public"."product_variants"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "public"."product_variants"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug" ASC);

-- CreateIndex
CREATE INDEX "products_status_isFeatured_idx" ON "public"."products"("status" ASC, "isFeatured" ASC);

-- CreateIndex
CREATE INDEX "products_status_slug_idx" ON "public"."products"("status" ASC, "slug" ASC);

-- CreateIndex
CREATE INDEX "reviews_productId_isApproved_idx" ON "public"."reviews"("productId" ASC, "isApproved" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "public"."users"("clerkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "public"."wishlist_items"("userId" ASC, "productId" ASC);

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_collections" ADD CONSTRAINT "campaign_collections_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign_collections" ADD CONSTRAINT "campaign_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lookbook_entries" ADD CONSTRAINT "lookbook_entries_lookbookId_fkey" FOREIGN KEY ("lookbookId") REFERENCES "public"."lookbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lookbook_entries" ADD CONSTRAINT "lookbook_entries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_collections" ADD CONSTRAINT "product_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_collections" ADD CONSTRAINT "product_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
