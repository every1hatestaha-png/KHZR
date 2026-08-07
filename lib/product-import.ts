import "server-only"

import { prisma } from "@/lib/prisma"
import { formatProductMerchandising } from "@/lib/product-merchandising"

const MAX_CSV_BYTES = 512 * 1024
const MAX_ROWS = 50
const IMAGE_DELIMITER = "|"
const COLLECTION_DELIMITER = "|"
const SIZES = ["S", "M", "L"] as const
const STATUSES = new Set(["DRAFT", "ACTIVE", "ARCHIVED"])
const FORMULA_PREFIX = /^[=+\-@]/

export const PRODUCT_IMPORT_LIMITS = {
  maxCsvBytes: MAX_CSV_BYTES,
  maxRows: MAX_ROWS,
  imageDelimiter: IMAGE_DELIMITER,
  collectionDelimiter: COLLECTION_DELIMITER,
} as const

export const PRODUCT_IMPORT_HEADERS = [
  "Product name",
  "Slug",
  "Subtitle",
  "Description",
  "Price in PKR",
  "Compare-at price",
  "Status",
  "Featured",
  "Fabric",
  "Color",
  "Work type",
  "Pieces included",
  "Sleeve style",
  "Neckline",
  "Season",
  "Size guide notes",
  "Care instructions",
  "Collection",
  "Image URLs",
  "SEO title",
  "SEO description",
  "S SKU",
  "S Stock",
  "S Active",
  "M SKU",
  "M Stock",
  "M Active",
  "L SKU",
  "L Stock",
  "L Active",
] as const

export const PRODUCT_IMPORT_SAMPLE_ROWS = [
  [
    "Ivory Ready to Wear Kurta",
    "ivory-ready-to-wear-kurta",
    "Printed lawn kurta for everyday wear",
    "A relaxed eastern ready-to-wear kurta with a clean line.",
    "8500",
    "9500",
    "ACTIVE",
    "yes",
    "Printed lawn",
    "Ivory",
    "Printed",
    "Shirt, Trouser, Dupatta",
    "Full sleeve",
    "Round neck",
    "Summer",
    "Relaxed fit. Model wears S.",
    "Gentle hand wash separately.",
    "Ready to Wear|New Arrivals",
    "https://example.com/images/ivory-kurta-1.jpg|https://example.com/images/ivory-kurta-2.jpg",
    "Ivory Ready to Wear Kurta - KHZR",
    "Shop the Ivory Ready to Wear Kurta by KHZR in Pakistan.",
    "KHZR-IVORY-KURTA-S",
    "4",
    "yes",
    "KHZR-IVORY-KURTA-M",
    "6",
    "yes",
    "KHZR-IVORY-KURTA-L",
    "3",
    "yes",
  ],
]

export type ProductImportRowResult = {
  row: number
  slug: string
  name: string
  action: "create" | "update"
  valid: boolean
  errors: string[]
}

export type ProductImportPreview = {
  ok: true
  totalRows: number
  validRows: number
  invalidRows: number
  productsToCreate: number
  productsToUpdate: number
  errors: ProductImportRowResult[]
  rows: ProductImportRowResult[]
}

export type ProductImportResult =
  | (ProductImportPreview & {
      imported: false
      dryRun: true
      message: string
    })
  | {
      ok: true
      imported: true
      dryRun: false
      totalRows: number
      importedRows: number
      skippedRows: number
      productsCreated: number
      productsUpdated: number
      message: string
    }

type ParsedCsvRow = Record<string, string>

type PreparedVariant = {
  size: string
  sku: string
  stock: number
  active: boolean
}

type PreparedProduct = {
  row: number
  name: string
  slug: string
  subtitle: string
  description: string
  price: number
  compareAtPrice: number | null
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  isFeatured: boolean
  composition: string
  care: string
  color: string
  seoTitle: string
  seoDescription: string
  imageUrls: string[]
  collectionIds: string[]
  isNew: boolean
  variants: PreparedVariant[]
  action: "create" | "update"
}

type CollectionLookup = Map<string, { id: string; name: string; slug: string }>

function csvEscape(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function productImportSampleCsv() {
  return [PRODUCT_IMPORT_HEADERS, ...PRODUCT_IMPORT_SAMPLE_ROWS]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n")
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (char !== "\r") {
      cell += char
    }
  }

  row.push(cell)
  rows.push(row)
  return rows.filter((r) => r.some((value) => value.trim() !== ""))
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function cell(row: ParsedCsvRow, header: string) {
  return row[normalizeHeader(header)]?.trim() ?? ""
}

function parseBoolean(value: string, fallback = false) {
  if (!value) return fallback
  return ["1", "true", "yes", "y", "active"].includes(value.trim().toLowerCase())
}

function parseRequiredMoney(value: string) {
  if (!value) return null
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function parseOptionalMoney(value: string) {
  if (!value) return null
  return parseRequiredMoney(value)
}

function unsafeText(value: string) {
  return FORMULA_PREFIX.test(value.trim())
}

function addError(errors: string[], condition: boolean, message: string) {
  if (condition) errors.push(message)
}

async function readCsvFile(file: File) {
  if (file.size <= 0) throw new Error("Upload a CSV file.")
  if (file.size > MAX_CSV_BYTES) throw new Error("CSV file must be 512 KB or smaller.")
  if (file.type && !["text/csv", "application/vnd.ms-excel", "text/plain"].includes(file.type)) {
    throw new Error("Upload a CSV file.")
  }
  return file.text()
}

async function collectionLookup(): Promise<CollectionLookup> {
  const collections = await prisma.collection.findMany({ select: { id: true, name: true, slug: true } })
  const lookup: CollectionLookup = new Map()
  for (const collection of collections) {
    lookup.set(normalizeKey(collection.slug), collection)
    lookup.set(normalizeKey(collection.name), collection)
  }
  return lookup
}

function parseRows(csv: string): ParsedCsvRow[] {
  const matrix = parseCsv(csv.replace(/^\uFEFF/, ""))
  if (matrix.length < 2) return []
  const headers = matrix[0].map(normalizeHeader)
  return matrix.slice(1).map((values) => {
    const row: ParsedCsvRow = {}
    for (let i = 0; i < headers.length; i += 1) row[headers[i]] = values[i] ?? ""
    return row
  })
}

async function analyzeCsv(file: File) {
  const csv = await readCsvFile(file)
  const rows = parseRows(csv)
  if (rows.length === 0) throw new Error("CSV must include a header row and at least one product row.")
  if (rows.length > MAX_ROWS) throw new Error(`CSV can include at most ${MAX_ROWS} product rows.`)

  const collections = await collectionLookup()
  const slugs = rows.map((row) => cell(row, "Slug")).filter(Boolean)
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const productBySlug = new Map(products.map((product) => [product.slug, product]))
  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: SIZES.flatMap((size) => rows.map((row) => cell(row, `${size} SKU`)).filter(Boolean)) } },
    select: { sku: true, product: { select: { slug: true } } },
  })
  const skuOwner = new Map(variants.map((variant) => [variant.sku, variant.product.slug]))
  const seenSlugs = new Map<string, number>()
  const seenSkus = new Map<string, number>()
  const prepared: PreparedProduct[] = []
  const results: ProductImportRowResult[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const errors: string[] = []
    const name = cell(row, "Product name")
    const slug = cell(row, "Slug")
    const statusRaw = cell(row, "Status")
    const status = statusRaw.toUpperCase()
    const price = parseRequiredMoney(cell(row, "Price in PKR"))
    const compareAtPriceRaw = cell(row, "Compare-at price")
    const compareAtPrice = parseOptionalMoney(compareAtPriceRaw)
    const color = cell(row, "Color")
    const collectionNames = cell(row, "Collection").split(COLLECTION_DELIMITER).map((v) => v.trim()).filter(Boolean)
    const imageUrls = cell(row, "Image URLs").split(IMAGE_DELIMITER).map((v) => v.trim()).filter(Boolean)
    const collectionIds: string[] = []

    addError(errors, !name, "Product name is required.")
    addError(errors, !slug, "Slug is required.")
    addError(errors, Boolean(slug) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), "Slug must be lowercase words separated by hyphens.")
    addError(errors, price === null, "Price in PKR must be a valid non-negative amount.")
    addError(errors, Boolean(compareAtPriceRaw) && compareAtPrice === null, "Compare-at price must be a valid non-negative amount.")
    addError(errors, !statusRaw, "Status is required.")
    addError(errors, Boolean(statusRaw) && !STATUSES.has(status), "Status must be DRAFT, ACTIVE, or ARCHIVED.")
    addError(errors, !color, "Color is required.")
    addError(errors, collectionNames.length === 0, "At least one existing collection is required.")
    addError(errors, imageUrls.length === 0, "At least one image URL is required.")
    addError(errors, imageUrls.length > 12, "Use 12 image URLs or fewer.")

    if (slug) {
      const firstRow = seenSlugs.get(slug)
      if (firstRow) errors.push(`Duplicate slug also appears on row ${firstRow}.`)
      else seenSlugs.set(slug, rowNumber)
    }

    for (const value of [name, cell(row, "Subtitle"), cell(row, "Description"), color, cell(row, "SEO title"), cell(row, "SEO description"), cell(row, "Work type"), cell(row, "Pieces included"), cell(row, "Sleeve style"), cell(row, "Neckline"), cell(row, "Season"), cell(row, "Size guide notes")]) {
      addError(errors, Boolean(value) && unsafeText(value), "Text fields cannot begin with =, +, -, or @.")
    }

    const workType = cell(row, "Work type")
    addError(errors, Boolean(workType) && !["Printed", "Embroidered", "Digital Print"].includes(workType), "Work type must be Printed, Embroidered, or Digital Print when provided.")

    for (const url of imageUrls) {
      try {
        const parsed = new URL(url)
        addError(errors, !["http:", "https:"].includes(parsed.protocol), `Image URL must be http(s): ${url}`)
      } catch {
        errors.push(`Invalid image URL: ${url}`)
      }
    }

    for (const nameOrSlug of collectionNames) {
      const collection = collections.get(normalizeKey(nameOrSlug))
      if (collection) collectionIds.push(collection.id)
      else errors.push(`Collection does not exist: ${nameOrSlug}`)
    }
    const isNew = collectionNames.some((nameOrSlug) => normalizeKey(nameOrSlug) === "new-arrivals")

    const preparedVariants: PreparedVariant[] = []
    for (const size of SIZES) {
      const sku = cell(row, `${size} SKU`)
      const stockRaw = cell(row, `${size} Stock`)
      const stock = Number(stockRaw)
      addError(errors, !sku, `${size} SKU is required.`)
      addError(errors, unsafeText(sku), `${size} SKU cannot begin with =, +, -, or @.`)
      addError(errors, !/^\d+$/.test(stockRaw), `${size} Stock must be zero or a positive whole number.`)
      const owner = skuOwner.get(sku)
      if (owner && owner !== slug) errors.push(`${size} SKU already belongs to product ${owner}.`)
      const firstRow = seenSkus.get(sku)
      if (sku && firstRow) errors.push(`${size} SKU duplicates a SKU on row ${firstRow}.`)
      else if (sku) seenSkus.set(sku, rowNumber)
      preparedVariants.push({ size, sku, stock: Number.isFinite(stock) ? stock : 0, active: parseBoolean(cell(row, `${size} Active`), true) })
    }

    const action: "create" | "update" = productBySlug.has(slug) ? "update" : "create"
    const result = { row: rowNumber, slug, name, action, valid: errors.length === 0, errors }
    results.push(result)

    if (errors.length === 0 && price !== null && STATUSES.has(status)) {
      prepared.push({
        row: rowNumber,
        name,
        slug,
        subtitle: cell(row, "Subtitle"),
        description: formatProductMerchandising({
          body: cell(row, "Description"),
          workType,
          piecesIncluded: cell(row, "Pieces included") || cell(row, "What is included"),
          sleeveStyle: cell(row, "Sleeve style"),
          neckline: cell(row, "Neckline"),
          season: cell(row, "Season"),
          sizeGuideNotes: cell(row, "Size guide notes"),
        }),
        price,
        compareAtPrice,
        status: status as PreparedProduct["status"],
        isFeatured: parseBoolean(cell(row, "Featured")),
        composition: cell(row, "Fabric"),
        care: cell(row, "Care instructions"),
        color,
        seoTitle: cell(row, "SEO title"),
        seoDescription: cell(row, "SEO description"),
        imageUrls: [...new Set(imageUrls)],
        collectionIds: [...new Set(collectionIds)],
        isNew,
        variants: preparedVariants,
        action,
      })
    }
  })

  return { rows: results, prepared }
}

function previewFromRows(rows: ProductImportRowResult[]): ProductImportPreview {
  return {
    ok: true,
    totalRows: rows.length,
    validRows: rows.filter((row) => row.valid).length,
    invalidRows: rows.filter((row) => !row.valid).length,
    productsToCreate: rows.filter((row) => row.valid && row.action === "create").length,
    productsToUpdate: rows.filter((row) => row.valid && row.action === "update").length,
    errors: rows.filter((row) => !row.valid),
    rows,
  }
}

export async function previewProductImport(file: File): Promise<ProductImportPreview> {
  const analysis = await analyzeCsv(file)
  return previewFromRows(analysis.rows)
}

export async function importProductsFromCsv(input: { file: File; dryRun: boolean; validRowsOnly: boolean }): Promise<ProductImportResult> {
  const analysis = await analyzeCsv(input.file)
  const preview = previewFromRows(analysis.rows)
  if (input.dryRun) return { ...preview, imported: false, dryRun: true, message: "Dry run complete. No products were changed." }
  if (preview.invalidRows > 0 && !input.validRowsOnly) {
    throw new Error("The CSV has invalid rows. Fix them or explicitly import valid rows only.")
  }

  const rowsToImport = input.validRowsOnly
    ? analysis.prepared.filter((row) => analysis.rows.find((result) => result.row === row.row)?.valid)
    : analysis.prepared

  await prisma.$transaction(
    async (tx) => {
      for (const row of rowsToImport) {
        const totalStock = row.variants.filter((variant) => variant.active).reduce((sum, variant) => sum + variant.stock, 0)
        const stockStatus = totalStock <= 0 ? "OUT_OF_STOCK" : totalStock <= 5 ? "LOW_STOCK" : "IN_STOCK"
        const product = await tx.product.upsert({
          where: { slug: row.slug },
          create: {
            name: row.name,
            slug: row.slug,
            subtitle: row.subtitle || null,
            description: row.description || null,
            composition: row.composition || null,
            care: row.care || null,
            price: row.price,
            compareAtPrice: row.compareAtPrice,
            currency: "PKR",
            status: row.status,
            stockStatus,
            isNew: row.isNew,
            isFeatured: row.isFeatured,
            seoTitle: row.seoTitle || null,
            seoDescription: row.seoDescription || null,
          },
          update: {
            name: row.name,
            subtitle: row.subtitle || null,
            description: row.description || null,
            composition: row.composition || null,
            care: row.care || null,
            price: row.price,
            compareAtPrice: row.compareAtPrice,
            currency: "PKR",
            status: row.status,
            stockStatus,
            isNew: row.isNew,
            isFeatured: row.isFeatured,
            seoTitle: row.seoTitle || null,
            seoDescription: row.seoDescription || null,
          },
          select: { id: true },
        })

        await tx.productCollection.deleteMany({ where: { productId: product.id } })
        if (row.collectionIds.length > 0) {
          await tx.productCollection.createMany({
            data: row.collectionIds.map((collectionId, position) => ({ productId: product.id, collectionId, position })),
            skipDuplicates: true,
          })
        }

        await tx.productMedia.deleteMany({ where: { productId: product.id } })
        await tx.productMedia.createMany({
          data: row.imageUrls.map((url, position) => ({
            productId: product.id,
            publicId: url,
            url,
            alt: row.name,
            kind: "IMAGE",
            position,
          })),
        })

        const existingVariants = await tx.productVariant.findMany({ where: { productId: product.id }, select: { id: true, sku: true } })
        const incomingSkus = new Set(row.variants.map((variant) => variant.sku))
        for (const variant of row.variants) {
          const existingBySize = await tx.productVariant.findUnique({
            where: { productId_size_color: { productId: product.id, size: variant.size, color: row.color } },
            select: { id: true },
          })
          if (existingBySize) {
            await tx.productVariant.update({
              where: { id: existingBySize.id },
              data: {
                sku: variant.sku,
                stock: variant.stock,
                active: variant.active,
              },
            })
          } else {
            await tx.productVariant.upsert({
              where: { sku: variant.sku },
              create: {
                productId: product.id,
                size: variant.size,
                color: row.color,
                colorHex: null,
                sku: variant.sku,
                stock: variant.stock,
                lowStockAt: 5,
                active: variant.active,
              },
              update: {
                size: variant.size,
                color: row.color,
                colorHex: null,
                stock: variant.stock,
                active: variant.active,
              },
            })
          }
        }
        for (const variant of existingVariants) {
          if (!incomingSkus.has(variant.sku)) {
            await tx.productVariant.update({ where: { id: variant.id }, data: { active: false } })
          }
        }
      }
    },
    { timeout: 30000 }
  )

  return {
    ok: true,
    imported: true,
    dryRun: false,
    totalRows: preview.totalRows,
    importedRows: rowsToImport.length,
    skippedRows: preview.totalRows - rowsToImport.length,
    productsCreated: rowsToImport.filter((row) => row.action === "create").length,
    productsUpdated: rowsToImport.filter((row) => row.action === "update").length,
    message: "Product import complete.",
  }
}
