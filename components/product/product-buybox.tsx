"use client"

import * as React from "react"
import { toast } from "sonner"
import { useCart } from "@/components/cart/cart-provider"
import { ProductAccordions } from "@/components/product/product-accordions"
import { Price } from "@/components/shared/price"
import { QuantityStepper } from "@/components/shared/quantity-stepper"
import { Button } from "@/components/ui/button"
import { WishlistToggle } from "@/components/wishlist/wishlist-toggle"
import { analytics } from "@/lib/analytics"
import { detailToSummary } from "@/lib/product-summary"
import { parseProductMerchandising, productMerchandisingRows } from "@/lib/product-merchandising"
import type { ProductDetailDTO } from "@/lib/data-access/site"
import { cn } from "@/lib/utils"

export function ProductBuybox({ product }: { product: ProductDetailDTO }) {
  const { addItem } = useCart()
  const merchandising = parseProductMerchandising(product.description)

  React.useEffect(() => {
    const first = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0]
    analytics.productViewed({
      item: {
        item_id: product.slug,
        item_name: product.name,
        item_variant: first ? [first.color, first.size].filter(Boolean).join(" / ") : undefined,
        price: product.price,
        quantity: 1,
      },
      value: product.price,
      currency: product.currency,
    })
  }, [product])

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)))
  const colors = Array.from(new Set(product.variants.map((v) => v.color)))
  const inStockVariants = product.variants.filter((v) => v.stock > 0)
  const soldOut = inStockVariants.length === 0

  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    () => inStockVariants[0]?.color ?? null
  )
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)

  const selectedVariant =
    product.variants.find(
      (v) =>
        v.size === selectedSize &&
        v.color === selectedColor &&
        v.stock > 0
    ) ?? null

  const lowStock =
    selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5

  const wishlistItem = React.useMemo(
    () =>
      detailToSummary(product, selectedVariant ?? inStockVariants[0] ?? {
        variantId: "",
        size: "One Size",
        color: "Noir",
        colorHex: null,
        stock: 0,
      }),
    [product, selectedVariant, inStockVariants]
  )

  function selectColor(color: string) {
    setSelectedColor(color)
    analytics.productOption({ option: "color", value: color, productSlug: product.slug })
    if (
      selectedSize &&
      !product.variants.some(
        (v) => v.size === selectedSize && v.color === color && v.stock > 0
      )
    ) {
      setSelectedSize(
        product.variants.find((v) => v.color === color && v.stock > 0)?.size ??
          null
      )
    }
  }

  function selectSize(size: string) {
    setSelectedSize(size)
    analytics.productOption({ option: "size", value: size, productSlug: product.slug })
    if (
      selectedColor &&
      !product.variants.some(
        (v) => v.size === size && v.color === selectedColor && v.stock > 0
      )
    ) {
      setSelectedColor(
        product.variants.find((v) => v.size === size && v.stock > 0)?.color ??
          null
      )
    }
  }

  function handleAdd() {
    if (!selectedSize) {
      toast.error("Choose a size before adding this item.")
      return
    }
    if (!selectedVariant) {
      toast.error("This size is unavailable.")
      return
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} available in this size.`)
      return
    }
    const summary = detailToSummary(product, selectedVariant)
    void addItem(summary, quantity)
  }

  const addLabel = soldOut
    ? "Sold Out"
    : selectedVariant
      ? "Add to Bag"
      : "Select a Size"

  return (
    <div className="lg:sticky lg:top-28">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-4xl font-light leading-[1.05] tracking-tight text-noir [overflow-wrap:anywhere] lg:text-5xl">
            {product.name}
          </h1>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
            Ready to Wear
          </p>

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
              Color
            </span>
            <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe" aria-live="polite">
              {selectedVariant?.color ?? "Select a color"}
            </span>
          </div>

          <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available =
                product.variants.filter(
                  (v) =>
                    v.color === color &&
                    v.stock > 0 &&
                    (!selectedSize || v.size === selectedSize)
                ).length > 0
              const isSelected = selectedColor === color
              const swatch = product.variants.find(
                (v) => v.color === color && v.colorHex
              )?.colorHex
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!available}
                  onClick={() => selectColor(color)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 border px-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ease-lux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
                    isSelected
                      ? "border-noir bg-noir text-warm-white"
                      : "border-hairline bg-background text-noir hover:border-stone",
                    !available &&
                      "pointer-events-none border-transparent opacity-30 line-through"
                  )}
                >
                  {swatch ? (
                    <span
                      aria-label={`${color} swatch`}
                      className="size-3 rounded-full border border-black/10"
                      style={{ backgroundColor: swatch }}
                    />
                  ) : null}
                  {color}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-taupe">
              Size
            </span>
            <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe" aria-live="polite">
              {selectedVariant?.size ?? "Select a size"}
            </span>
          </div>

          <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available =
                product.variants.filter(
                  (v) =>
                    v.size === size &&
                    v.stock > 0 &&
                    (!selectedColor || v.color === selectedColor)
                ).length > 0
              const isSelected = selectedSize === size
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!available}
                  onClick={() => selectSize(size)}
                  className={cn(
                    "h-11 min-w-11 border px-3 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ease-lux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
                    isSelected
                      ? "border-noir bg-noir text-warm-white"
                      : "border-hairline bg-background text-noir hover:border-stone",
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
              max={selectedVariant?.stock ?? 10}
              label={`quantity of ${product.name}`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="min-h-12 w-full"
              onClick={handleAdd}
              disabled={soldOut}
            >
              {addLabel}
            </Button>
            {!soldOut && !selectedSize ? (
              <p className="text-center text-xs text-stone">Choose a size to add this item.</p>
            ) : selectedSize && !selectedVariant ? (
              <p className="text-center text-xs text-stone">This size is unavailable.</p>
            ) : null}
            <div className="flex items-center justify-center gap-3 border border-hairline bg-background px-4 py-3">
              <WishlistToggle
                item={wishlistItem}
                className="size-11 shrink-0 border border-hairline hover:border-stone"
              />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-noir">
                Save to Wishlist
              </span>
            </div>
          </div>

          <p className="text-center text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
            Lahore delivery: 2 to 3 business days. Cash on Delivery available.
          </p>
        </div>

        <FitFabricCareSummary product={product} merchandising={merchandising} />
      </div>

      <div className="mt-10">
        <ProductAccordions product={product} />
      </div>
    </div>
  )
}

function FitFabricCareSummary({ product, merchandising }: { product: ProductDetailDTO; merchandising: ReturnType<typeof parseProductMerchandising> }) {
  const sizes = ["S", "M", "L"].filter((size) => product.variants.some((variant) => variant.size === size))
  const colors = Array.from(new Set(product.variants.map((variant) => variant.color))).join(", ")
  const items = [
    {
      label: "Category",
      value: "Ready to Wear",
    },
    {
      label: "Fabric",
      value: product.composition || "Fabric details will appear here.",
    },
    {
      label: "Color",
      value: colors || "Color details will appear here.",
    },
    ...productMerchandisingRows(merchandising).map((item) => ({ label: item.label, value: item.value })),
    {
      label: "Sizes",
      value: sizes.length > 0 ? sizes.join(", ") : "S, M, L",
    },
    {
      label: "Care",
      value: product.care || "Handle gently between wears.",
    },
  ]

  return (
    <dl className="grid gap-0 border-y border-hairline text-sm leading-relaxed text-stone">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-hairline py-4 last:border-b-0">
          <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-taupe">
            {item.label}
          </dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
