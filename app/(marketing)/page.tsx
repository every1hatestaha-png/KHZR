import { HeroCampaign } from "@/components/marketing/hero-campaign"
import { EditorialSplit } from "@/components/marketing/editorial-split"
import { ProductRail } from "@/components/marketing/product-rail"
import { BrandStatement } from "@/components/marketing/brand-statement"
import { CategoryGrid } from "@/components/marketing/category-grid"
import { FinalHomeCta } from "@/components/marketing/final-home-cta"
import { getFeaturedProducts, getHomeCampaigns, getHomepageSettingsCampaign } from "@/lib/data-access/site"
import { buildMetadata, jsonLdItemList, jsonLdScript } from "@/lib/seo"
import { SITE } from "@/lib/constants"

export const metadata = buildMetadata({
  description: SITE.description,
  path: "/",
})

export default async function HomePage() {
  const [campaigns, products, settingsHero] = await Promise.all([
    getHomeCampaigns(),
    getFeaturedProducts(),
    getHomepageSettingsCampaign(),
  ])

  const [, second] = campaigns
  const heroCampaign = settingsHero ?? {
    kicker: "Ready to Wear",
    title: "Eastern dresses, ready now.",
    subtitle:
      "Printed Pret and Embroidered Pret for women in Pakistan, priced in PKR for launch.",
    ctaLabel: null,
    ctaHref: null,
    imageUrl:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=2400&q=85",
  }
  const signatureStory = {
    kicker: "Launch Edit",
    title: "Shirts, trousers, dupattas.",
    subtitle:
      "Each product page lists fabric, work, included pieces, care, and size notes when provided.",
    ctaLabel: "Shop Ready to Wear",
    ctaHref: "/collections",
    imageUrl: second?.imageUrl ?? products[0]?.imageUrl ?? heroCampaign.imageUrl,
  }

  return (
    <>
      <HeroCampaign campaign={heroCampaign} />
      <ProductRail
        products={products}
        actionHref="/collection/new-arrivals"
        actionLabel="VIEW ALL"
      />
      <CategoryGrid images={products.map((product) => product.imageUrl)} />
      <BrandStatement />
      <EditorialSplit campaign={signatureStory} />
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
