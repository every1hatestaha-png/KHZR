import Link from "next/link"
import { PageIntro } from "@/components/shared/page-intro"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const title = slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ")
  return buildMetadata({
    title,
    description:
      "Product pages open with the full catalogue — galleries, sizing, materials and the campaign imagery.",
    path: `/product/${slug}`,
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const title = slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <>
      <PageIntro
        kicker="The Catalogue"
        title={title}
        description="Product pages open with the full catalogue — an editorial gallery, sizing and materials, and a considered checkout."
      />
      <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 border-t border-hairline px-5 py-20 text-center lg:px-10 lg:py-28">
        <Button asChild variant="luxury-link">
          <Link href="/collections">Explore the Collections</Link>
        </Button>
      </section>
    </>
  )
}
