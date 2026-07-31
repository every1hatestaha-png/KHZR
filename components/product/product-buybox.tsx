"use client"

import * as React from "react"
import { useCart } from "@/components/cart/cart-provider"
import { ProductAccordions } from "@/components/product/product-accordions"
import { Price } from "@/components/shared/price"
import { QuantityStepper } from "@/components/shared/quantity-stepper"
import { Button } from "@/components/ui/button"
import type { ProductDetailDTO } from "@/lib/data-access/site"
import { cn } from "@/lib/utils"

export function ProductBuybox({ product }: { product: ProductDetailDTO }) {
  const { addItem } = useCart()

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)))
  const inStockVariants = product.variants.filter((v) => v.stock > 0)
  const soldOut = inStockVariants.length === 0

  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    () => inStockVariants[0]?.size ?? null
  )
  const [quantity, setQuantity] = React.useState(1)

  const selectedVariant =
    product.variants.find(
      (v) => v.size === selectedSize && v.stock > 0
    ) ?? null

  const label = soldOut
    ? "Sold Out"
    : product.badge === "LOW_STOCK"
      ? "Low Stock"
      : product.isNew
        ? "New"
        : product.collectionName

  const lowStock =
    selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5

  function handleAdd() {
    if (!selectedVariant) return
    void addItem(
      {
        productId: product.slug,
        productSlug: product.slug,
        variantId: selectedVariant.variantId,
        name: product.name,
        subtitle: product.subtitle,
        size: selectedVariant.size,
        color: selectedVariant.color,
        colorHex: selectedVariant.colorHex,
        imageUrl: product.images[0] ?? null,
        unitPrice: product.price,
        available: selectedVariant.stock,
      },
      quantity
    )
  }

  return (
    <div className="lg:sticky lg:top-28">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            <span
              className={cn(
                "h-px w-8",
                product.isNew || product.badge === "LOW_STOCK"
                  ? "bg-champagne"
                  : "bg-champagne/50"
              )}
              aria-hidden
            />
            {label}
          </p>

          <h1 className="font-display text-4xl font-light leading-[1.05] tracking-tight text-noir lg:text-[2.75rem]">
            {product.name}
          </h1>

          <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />

          {product.subtitle ? (
            <p className="max-w-md text-sm leading-relaxed text-stone">
              {product.subtitle}
            </p>
          ) : null}
        </div>

        <div className="h-px bg-hairline" aria-hidden />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
              Size
            </span>
            <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
              {selectedVariant?.size ?? "Select a size"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available =
                product.variants.filter(
                  (v) => v.size === size && v.stock > 0
                ).length > 0
              const isSelected = selectedSize === size
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 min-w-11 border px-3 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ease-lux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
                    isSelected
                      ? "border-noir bg-noir text-warm-white"
                      : "border-hairline text-noir hover:border-stone",
                    !available &&
                      "pointer-events-none border-transparent opacity-30 line-through"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>

          {lowStock ? (
            <p className="text-xs text-stone">
              Low stock — only {selectedVariant!.stock} left in this size.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
              Quantity
            </span>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label={`quantity of ${product.name}`}
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAdd}
            disabled={soldOut || !selectedVariant}
          >
            {soldOut
              ? "Sold Out"
              : selectedVariant
                ? "Add to Bag"
                : "Select a Size"}
          </Button>

          <p className="text-center text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
            Complimentary shipping · Made to be kept
          </p>
        </div>
      </div>

      <div className="mt-10">
        <ProductAccordions product={product} />
      </div>
    </div>
  )
}
