import * as React from "react"
import { cn } from "@/lib/utils"

export function Hairline({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-full bg-hairline", className)}
      {...props}
    />
  )
}
