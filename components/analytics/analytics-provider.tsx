"use client"

import * as React from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { CONSENT_STORAGE_KEY, analytics, analyticsConfig, type ConsentPreferences } from "@/lib/analytics"

function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeConsent(value: ConsentPreferences) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event("khzr:consent"))
}

export function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [consent, setConsent] = React.useState<ConsentPreferences | null>(null)

  React.useEffect(() => {
    setConsent(readConsent())
    const sync = () => setConsent(readConsent())
    window.addEventListener("khzr:consent", sync)
    return () => window.removeEventListener("khzr:consent", sync)
  }, [])

  React.useEffect(() => {
    if (!consent) return
    const query = searchParams.toString()
    analytics.pageView(query ? `${pathname}?${query}` : pathname)
  }, [consent, pathname, searchParams])

  const analyticsAllowed = Boolean(consent?.analytics && analyticsConfig.gaMeasurementId)
  const marketingAllowed = Boolean(consent?.marketing && analyticsConfig.metaPixelId)

  return (
    <>
      {analyticsAllowed ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaMeasurementId}`} strategy="lazyOnload" />
          <Script id="khzr-ga4" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${analyticsConfig.gaMeasurementId}',{send_page_view:false});`}
          </Script>
        </>
      ) : null}
      {marketingAllowed ? (
        <Script id="khzr-meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analyticsConfig.metaPixelId}');`}
        </Script>
      ) : null}
      <CookieConsentBanner consent={consent} setConsent={setConsent} />
    </>
  )
}

function CookieConsentBanner({ consent, setConsent }: { consent: ConsentPreferences | null; setConsent: (value: ConsentPreferences) => void }) {
  if (consent) return null
  function save(value: ConsentPreferences) {
    writeConsent(value)
    setConsent(value)
  }
  return (
    <section className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-3xl border border-hairline bg-background p-5 shadow-sm" aria-label="Cookie consent">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-display text-xl text-noir">Privacy preferences</p>
          <p className="mt-2 text-sm leading-relaxed text-stone">Necessary cookies keep KHZR working. Analytics and marketing scripts load only if you allow them.</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-taupe">Necessary always enabled · Analytics optional · Marketing optional</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => save({ analytics: false, marketing: false })} className="h-10 border border-hairline px-4 text-[0.6875rem] uppercase tracking-[0.2em] text-noir">Necessary only</button>
          <button type="button" onClick={() => save({ analytics: true, marketing: false })} className="h-10 border border-hairline px-4 text-[0.6875rem] uppercase tracking-[0.2em] text-noir">Analytics</button>
          <button type="button" onClick={() => save({ analytics: true, marketing: true })} className="h-10 bg-noir px-4 text-[0.6875rem] uppercase tracking-[0.2em] text-warm-white">Allow all</button>
        </div>
      </div>
    </section>
  )
}
