import { z } from "zod"

export const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const
export const STOCK_STATUSES = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
] as const
export const CURRENCIES = ["PKR", "USD", "EUR", "GBP"] as const

const httpImageUrl = z
  .string()
  .url("Enter a valid image URL.")
  .refine((value) => /^https?:\/\//i.test(value), "Enter an http(s) image URL.")
  .min(1)

export const productImageSchema = z.object({
  url: httpImageUrl,
  alt: z.string().max(300).optional().default(""),
})

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Size is required."),
  color: z.string().min(1, "Colour is required."),
  colorHex: z.string().min(1, "Colour hex is required."),
  sku: z.string().min(1, "SKU is required."),
  priceOverride: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .pipe(z.number().finite().nonnegative().nullable()),
  stock: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(z.number().int().min(0)),
  lowStockAt: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? 5 : Number(v)))
    .pipe(z.number().int().min(0)),
  active: z.boolean().optional().default(true),
})

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lower-case URL slug, e.g. wool-overcoat."),
  subtitle: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(8000).optional().default(""),
  composition: z.string().trim().max(300).optional().default(""),
  care: z.string().trim().max(300).optional().default(""),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .pipe(z.number().finite().nonnegative("Price must be a valid amount.")),
  compareAtPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .pipe(z.number().finite().nonnegative().nullable()),
  currency: z.enum(CURRENCIES).default("PKR"),
  status: z.enum(STATUSES).default("DRAFT"),
  stockStatus: z.enum(STOCK_STATUSES).default("IN_STOCK"),
  sku: z.string().trim().max(120).optional().default(""),
  isNew: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(z.number().int().min(0)),
  seoTitle: z.string().trim().max(200).optional().default(""),
  seoDescription: z.string().trim().max(400).optional().default(""),
  collectionIds: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).min(1, "Add at least one variant."),
  images: z.array(productImageSchema).min(1, "Add at least one image."),
})

export const productListParamsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(STATUSES).optional(),
  collection: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(5).max(100).default(12),
})

export const collectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lower-case URL slug."),
  description: z.string().trim().max(800).optional().default(""),
  editorial: z.string().trim().max(8000).optional().default(""),
  imageUrl: z
    .union([z.literal(""), httpImageUrl])
    .optional()
    .default(""),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(z.number().int().min(0)),
  seoTitle: z.string().trim().max(200).optional().default(""),
  seoDescription: z.string().trim().max(400).optional().default(""),
})

export const inventoryUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        stock: z
          .union([z.string(), z.number()])
          .transform((v) => (v === "" ? 0 : Number(v)))
          .pipe(z.number().int().min(0)),
        active: z.boolean().optional(),
      })
    )
    .min(1),
})

export const bulkProductActionSchema = z.object({
  productIds: z.array(z.string().min(1).max(160)).min(1).max(100),
  action: z.enum(["feature", "unfeature", "archive", "activate"]),
})

export const bulkPriceUpdateSchema = z.object({
  productIds: z.array(z.string().min(1).max(160)).min(1).max(100),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .pipe(z.number().finite().nonnegative()),
  compareAtPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .pipe(z.number().finite().nonnegative().nullable()),
})

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120),
  ownerNotificationEmail: z.string().trim().email().or(z.literal("")).optional().default(""),
  customerSupportEmail: z.string().trim().email().or(z.literal("")).optional().default(""),
  instagramUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  facebookUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  contactDetails: z.string().trim().max(2000).optional().default(""),
  returnPolicyText: z.string().trim().max(8000).optional().default(""),
  shippingPolicyText: z.string().trim().max(8000).optional().default(""),
  footerLinks: z.string().trim().max(4000).optional().default(""),
})

export const homepageSettingsSchema = z.object({
  heroImageUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  heroMobileImageUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  heroLabel: z.string().trim().max(120).optional().default(""),
  heroHeading: z.string().trim().max(200).optional().default(""),
  heroDescription: z.string().trim().max(600).optional().default(""),
  heroButtonText: z.string().trim().max(80).optional().default(""),
  heroButtonLink: z.string().trim().max(200).optional().default(""),
  announcementText: z.string().trim().max(200).optional().default(""),
  announcementActive: z.boolean().optional().default(false),
  featuredProductIds: z.array(z.string().min(1).max(160)).max(24).default([]),
  featuredCollectionIds: z.array(z.string().min(1).max(160)).max(12).default([]),
  homepageCategoryLinks: z.string().trim().max(4000).optional().default(""),
  signatureImageUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  signatureKicker: z.string().trim().max(120).optional().default(""),
  signatureTitle: z.string().trim().max(200).optional().default(""),
  signatureSubtitle: z.string().trim().max(600).optional().default(""),
  signatureCtaLabel: z.string().trim().max(80).optional().default(""),
  signatureCtaHref: z.string().trim().max(200).optional().default(""),
})

export const mediaAssetSchema = z.object({
  url: httpImageUrl,
  publicId: z.string().trim().max(300).optional().default(""),
  alt: z.string().trim().max(300).optional().default(""),
})

export type ProductInput = z.infer<typeof productSchema>
export type CollectionInput = z.infer<typeof collectionSchema>
