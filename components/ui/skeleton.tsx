import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-ivory motion-reduce:animate-none", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
