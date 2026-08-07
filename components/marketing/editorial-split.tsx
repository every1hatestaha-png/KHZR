import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ImageReveal } from "@/components/shared/image-reveal"
import { LazyImage } from "@/components/shared/lazy-image"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CampaignDTO } from "@/lib/data-access/site"

export function EditorialSplit({
  campaign,
  reverse = false,
}: {
  campaign: CampaignDTO
  reverse?: boolean
}) {
  return (
    <section
      className={cn(
        "mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-28"
      )}
    >
      <div
        className={cn(
          "lg:col-span-7",
          reverse && "lg:order-2"
        )}
      >
        <ImageReveal className="relative aspect-[3/4] w-full bg-ivory lg:aspect-[9/16]">
          <LazyImage
            src={campaign.imageUrl}
            alt=""
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain"
          />
        </ImageReveal>
      </div>

      <div className={cn("lg:col-span-5", reverse && "lg:order-1")}>
        <Reveal className="flex flex-col gap-6">
          {campaign.kicker ? (
            <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
              <span className="h-px w-8 bg-champagne" aria-hidden />
              {campaign.kicker}
            </p>
          ) : null}
          <h2 className="font-display text-4xl font-light leading-[1.06] tracking-tight text-noir lg:text-5xl">
            {campaign.title}
          </h2>
          {campaign.subtitle ? (
            <p className="max-w-md text-base leading-relaxed text-stone">
              {campaign.subtitle}
            </p>
          ) : null}
          {campaign.ctaLabel && campaign.ctaHref ? (
            <Button asChild variant="luxury-link" className="mt-4 self-start">
              <Link href={campaign.ctaHref}>
                {campaign.ctaLabel}
                <ArrowRight className="ml-3 size-3.5" />
              </Link>
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
