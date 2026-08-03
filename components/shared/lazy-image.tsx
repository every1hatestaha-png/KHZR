"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type LazyImageProps = Omit<
  React.ComponentProps<typeof Image>,
  "loading" | "onLoad"
> & {
  eager?: boolean
  /** Force a CSS-relative default sizes when sizes is omitted */
  sizes?: string
}

export function LazyImage({
  eager = false,
  className,
  src,
  alt,
  sizes,
  fill = true,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = React.useState(eager)

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      className={cn(
        "bg-ivory transition-opacity duration-[450ms] ease-lux motion-reduce:transition-none",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  )
}
