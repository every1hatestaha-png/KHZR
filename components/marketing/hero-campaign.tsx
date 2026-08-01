import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Parallax } from "@/components/shared/parallax"
import { LazyImage } from "@/components/shared/lazy-image"
import { Button } from "@/components/ui/button"
import type { CampaignDTO } from "@/lib/data-access/site"

export function HeroCampaign({ campaign }: { campaign: CampaignDTO }) {
  return (
    <section
      className="relative flex min-h-[76svh] items-end overflow-hidden bg-noir sm:min-h-[82svh] lg:min-h-[88svh]"
      aria-label={campaign.title}
    >
      <Parallax offset={80} className="absolute inset-0">
        <LazyImage
          src={campaign.imageUrl}
          alt=""
          eager
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-noir/68 via-noir/24 to-noir/8"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-10 sm:px-5 sm:pb-14 lg:px-10 lg:pb-24">
        <div className="max-w-[40rem]">
          {campaign.kicker ? (
            <p className="animate-fade-up flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.34em] text-warm-white/85 [animation-delay:150ms]">
              <span className="h-px w-10 bg-champagne" aria-hidden />
              {campaign.kicker}
            </p>
          ) : null}
          <h1 className="mt-5 animate-fade-up font-display text-5xl font-light leading-[1.02] tracking-tight text-warm-white [overflow-wrap:anywhere] [animation-delay:300ms] sm:mt-6 sm:text-6xl lg:text-8xl">
            {campaign.title}
          </h1>
          {campaign.subtitle ? (
            <p className="mt-6 max-w-lg animate-fade-up text-base leading-relaxed text-warm-white/80 [animation-delay:450ms] lg:text-lg">
              {campaign.subtitle}
            </p>
          ) : null}
          <div className="mt-10 flex animate-fade-up [animation-delay:600ms]">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 border-warm-white/45 px-8 text-warm-white hover:border-warm-white hover:bg-warm-white hover:text-noir"
            >
              <Link href="/collections?sort=newest">
                Shop New In
                <ArrowRight className="ml-3 size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
