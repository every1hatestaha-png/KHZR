import { HeroCampaign } from "@/components/marketing/hero-campaign"
import { MarqueeStrip } from "@/components/marketing/marquee-strip"
import { EditorialSplit } from "@/components/marketing/editorial-split"
import { ProductRail } from "@/components/marketing/product-rail"
import { BrandValues } from "@/components/marketing/brand-values"
import { getFeaturedProducts, getHomeCampaigns } from "@/lib/data-access/site"
import { buildMetadata, jsonLdItemList } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  description: SITE.description,
  path: "/",
})

export default async function HomePage() {
  const [campaigns, products] = await Promise.all([
    getHomeCampaigns(),
    getFeaturedProducts(),
  ])

  const [hero, second] = campaigns

  return (
    <>
      {hero ? <HeroCampaign campaign={hero} /> : null}
      <MarqueeStrip />
      <ProductRail products={products} />

      {second ? (
        <EditorialSplit campaign={second} />
      ) : (
        <EditorialSplit
          campaign={{
            kicker: "The Maison",
            title: "The Art of Quiet",
            subtitle:
              "What we leave out is as deliberate as what we cut. On the grammar of quiet luxury.",
            ctaLabel: "Read the Journal",
            ctaHref: "/journal",
            imageUrl:
              "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=2000&q=80",
          }}
        />
      )}

      <BrandValues />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdItemList(
              products.map((p) => ({
                name: p.name,
                url: `${SITE.url}/product/${p.slug}`,
              }))
            )
          ),
        }}
      />
    </>
  )
}
