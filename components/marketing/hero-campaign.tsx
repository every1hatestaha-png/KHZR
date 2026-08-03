import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LazyImage } from "@/components/shared/lazy-image"
import { Button } from "@/components/ui/button"
import type { CampaignDTO } from "@/lib/data-access/site"

export function HeroCampaign({ campaign }: { campaign: CampaignDTO }) {
  return (
    <section
      className="relative flex min-h-[78svh] items-center overflow-hidden bg-ivory sm:min-h-[84svh] lg:min-h-[calc(100svh-4.5rem)]"
      aria-label={campaign.title}
    >
      <LazyImage
        src={campaign.imageUrl}
        alt=""
        eager
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] sm:object-[70%_center] lg:object-[74%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-noir/70 via-noir/34 to-transparent lg:w-[62%]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="max-w-[36rem] py-8 sm:py-12 lg:ml-8 lg:py-20">
          {campaign.kicker ? (
            <p className="animate-fade-up flex items-center gap-4 text-[0.6875rem] font-medium uppercase tracking-[0.38em] text-warm-white/88 [animation-delay:150ms]">
              <span className="h-px w-12 bg-warm-white/55" aria-hidden />
              {campaign.kicker}
            </p>
          ) : null}
          <h1 className="mt-8 animate-fade-up font-display text-5xl font-light leading-[1.02] tracking-tight text-warm-white [overflow-wrap:anywhere] [animation-delay:300ms] sm:text-7xl lg:text-[6.75rem]">
            {campaign.title}
          </h1>
          {campaign.subtitle ? (
            <p className="mt-8 max-w-md animate-fade-up text-base leading-relaxed text-warm-white/82 [animation-delay:450ms] lg:text-lg">
              {campaign.subtitle}
            </p>
          ) : null}
          <div className="mt-12 flex animate-fade-up [animation-delay:600ms]">
            <Button
              asChild
              size="lg"
              className="min-h-12 border-noir bg-noir px-9 text-[0.6875rem] font-medium uppercase tracking-[0.26em] text-warm-white hover:bg-stone hover:text-warm-white"
            >
              <Link href="/collection/new-arrivals">
                SHOP NEW ARRIVALS
                <ArrowRight className="ml-3 size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
