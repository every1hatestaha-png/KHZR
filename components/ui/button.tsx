import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap outline-none transition-all duration-300 ease-lux select-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-noir text-warm-white hover:bg-stone active:bg-noir",
        outline:
          "border border-noir/25 bg-transparent text-noir hover:border-noir hover:bg-noir/[0.03]",
        secondary:
          "bg-ivory text-noir hover:bg-sand",
        ghost:
          "bg-transparent text-noir hover:bg-noir/[0.05]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20",
        link: "text-noir underline-offset-8 hover:text-champagne hover:underline",
        "luxury-link":
          "relative px-1 text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-noir transition-colors hover:text-stone after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-100 after:bg-champagne after:transition-transform after:duration-500 after:ease-lux hover:after:origin-right hover:after:scale-x-0",
      },
      size: {
        default:
          "h-12 rounded-none px-8 text-[0.6875rem] font-medium uppercase tracking-[0.28em]",
        sm: "h-10 rounded-none px-6 text-[0.6875rem] font-medium uppercase tracking-[0.24em]",
        lg: "h-14 rounded-none px-12 text-xs font-medium uppercase tracking-[0.3em]",
        icon: "size-11 rounded-none",
        "icon-sm": "size-9 rounded-none",
        "icon-lg": "size-12 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
