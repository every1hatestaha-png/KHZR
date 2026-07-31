import type {
  ProductCardDTO,
  ProductDetailDTO,
} from "@/lib/data-access/site"
import type { ProductSummary } from "@/types"

export function cardToSummary(product: ProductCardDTO): ProductSummary {
  return {
    productId: product.slug,
    productSlug: product.slug,
    variantId: product.defaultVariant.variantId,
    name: product.name,
    subtitle: product.subtitle,
    size: product.defaultVariant.size,
    color: product.defaultVariant.color,
    colorHex: product.defaultVariant.colorHex,
    imageUrl: product.imageUrl,
    unitPrice: product.price,
    available: product.defaultVariant.stock,
  }
}

export function detailToSummary(
  product: ProductDetailDTO,
  variant: {
    variantId: string
    size: string
    color: string
    colorHex: string | null
    stock: number
  }
): ProductSummary {
  return {
    productId: product.slug,
    productSlug: product.slug,
    variantId: variant.variantId,
    name: product.name,
    subtitle: product.subtitle,
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    imageUrl: product.images[0] ?? null,
    unitPrice: product.price,
    available: variant.stock,
  }
}
