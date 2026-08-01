import { HeroCampaign } from "@/components/marketing/hero-campaign"
import { EditorialSplit } from "@/components/marketing/editorial-split"
import { ProductRail } from "@/components/marketing/product-rail"
import { BrandStatement } from "@/components/marketing/brand-statement"
import { CategoryGrid } from "@/components/marketing/category-grid"
import { FinalHomeCta } from "@/components/marketing/final-home-cta"
import { getFeaturedProducts, getHomeCampaigns } from "@/lib/data-access/site"
import { buildMetadata, jsonLdItemList, jsonLdScript } from "@/lib/seo"
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
  const heroCampaign = {
    kicker: "New In",
    title: "A softer way to stand apart.",
    subtitle:
      "Modern womenswear in warm neutrals, cut close to the body and the day.",
    ctaLabel: null,
    ctaHref: null,
    imageUrl:
      hero?.imageUrl ??
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=2000&q=80",
  }
  const signatureStory = {
    kicker: "Signature Proportion",
    title: "A clean shoulder, a narrow waist, a longer line.",
    subtitle:
      "The first read is shape: fabric held close enough to frame, loose enough to move.",
    ctaLabel: "Shop The Edit",
    ctaHref: "/collections",
    imageUrl: second?.imageUrl ?? products[0]?.imageUrl ?? heroCampaign.imageUrl,
  }

  return (
    <>
      <HeroCampaign campaign={heroCampaign} />
      <ProductRail
        products={products}
        actionHref="/collections"
        actionLabel="View All"
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
