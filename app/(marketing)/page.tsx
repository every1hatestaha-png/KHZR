import { HeroCampaign } from "@/components/marketing/hero-campaign"
import { EditorialSplit } from "@/components/marketing/editorial-split"
import { ProductRail } from "@/components/marketing/product-rail"
import { BrandStatement } from "@/components/marketing/brand-statement"
import { CategoryGrid } from "@/components/marketing/category-grid"
import { FinalHomeCta } from "@/components/marketing/final-home-cta"
import { getFeaturedProducts, getHomepageSettingsCampaign, getSignatureSection } from "@/lib/data-access/site"
import { buildMetadata, jsonLdItemList, jsonLdScript } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  title: "Ready-to-Wear Eastern Dresses for Women in Pakistan",
  description: SITE.description,
  path: "/",
})

export default async function HomePage() {
  const [products, heroCampaign, signatureStory] = await Promise.all([
    getFeaturedProducts(),
    getHomepageSettingsCampaign(),
    getSignatureSection(),
  ])

  return (
    <>
      {heroCampaign ? <HeroCampaign campaign={heroCampaign} /> : null}
      <ProductRail
        products={products}
        actionHref="/collection/new-arrivals"
        actionLabel="VIEW ALL"
      />
      <CategoryGrid images={products.map((product) => product.imageUrl)} />
      <BrandStatement />
      {signatureStory ? <EditorialSplit campaign={signatureStory} /> : null}
      <FinalHomeCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
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
