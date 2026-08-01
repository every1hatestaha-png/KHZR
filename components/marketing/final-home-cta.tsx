import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE } from "@/lib/constants"

export function FinalHomeCta() {
  return (
    <section className="bg-ivory/60">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-5 py-16 lg:flex-row lg:items-center lg:px-10 lg:py-20">
        <div className="max-w-xl">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-taupe">
            New Arrivals
          </p>
          <h2 className="mt-4 font-display text-4xl font-light leading-[1.08] tracking-tight text-noir lg:text-5xl">
            Begin with the pieces closest to now.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            {SITE.shippingNote}. Secure payment through Stripe.
          </p>
        </div>
        <Button asChild size="lg" className="min-h-11 shrink-0">
          <Link href="/collections?sort=newest">
            Explore New Arrivals
            <ArrowRight className="ml-3 size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  )
}
