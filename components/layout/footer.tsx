import Link from "next/link"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { FOOTER_LINKS, SITE } from "@/lib/constants"

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-taupe">
        {title}
      </h3>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-noir/80 transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-hairline bg-ivory/60">
      <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-14 sm:px-5 lg:px-10 lg:pt-24">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <p className="font-display text-3xl font-light leading-snug text-noir lg:text-4xl">
              A clear line,
              <br />
              softly worn.
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-stone">
              {SITE.description}
            </p>
            <div className="mt-2 max-w-sm">
              <NewsletterForm />
            </div>
          </div>
          <FooterColumn title="The House" links={FOOTER_LINKS.house} />
          <FooterColumn title="Client Care" links={FOOTER_LINKS.client} />
          <FooterColumn
            title="Follow"
            links={[
              { label: "Instagram", href: SITE.social.instagram },
              { label: "Pinterest", href: SITE.social.pinterest },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-6 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-display text-base tracking-[0.4em] text-noir">
            KHZR
          </p>
          <p className="text-xs text-taupe">
            © {year} {SITE.legalName} · {SITE.address.city},{" "}
            {SITE.address.country} · KHZR
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[0.6875rem] uppercase tracking-[0.22em] text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[0.6875rem] uppercase tracking-[0.22em] text-taupe transition-colors hover:text-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
