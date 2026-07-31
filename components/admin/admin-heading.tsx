import { cn } from "@/lib/utils"

type AdminHeadingProps = {
  kicker?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function AdminHeading({
  kicker,
  title,
  description,
  actions,
  className,
}: AdminHeadingProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 border-b border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {kicker ? (
          <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            <span className="h-px w-8 bg-champagne" aria-hidden />
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-4xl font-light leading-[1.05] tracking-tight text-noir">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-stone">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  )
}
