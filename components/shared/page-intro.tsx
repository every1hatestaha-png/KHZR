import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

type PageIntroProps = {
  kicker?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  children?: React.ReactNode
}

export function PageIntro({
  kicker,
  title,
  description,
  align = "left",
  className,
  children,
}: PageIntroProps) {
  return (
    <Reveal
      className={cn(
        "mx-auto flex max-w-[1400px] flex-col gap-6 px-5 pb-16 pt-20 lg:px-10 lg:pt-28",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {kicker ? (
        <div
          className={cn(
            "flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-8 bg-champagne" aria-hidden />
          {kicker}
        </div>
      ) : null}
      <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-noir lg:text-7xl">
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed text-stone",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </Reveal>
  )
}
