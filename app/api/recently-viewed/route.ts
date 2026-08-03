import { NextResponse } from "next/server"
import { getRecentlyViewedProducts } from "@/lib/data-access/site"
import { rateLimit } from "@/lib/services/rate-limit"

const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/

export async function GET(request: Request) {
  const allowed = await rateLimit("api:recently-viewed", 120, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ products: [] }, { status: 429 })
  }

  const url = new URL(request.url)
  const exclude = url.searchParams.get("exclude") ?? undefined
  const slugs = (url.searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => SLUG_PATTERN.test(slug))
    .slice(0, 10)

  if (exclude && !SLUG_PATTERN.test(exclude)) {
    return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "private, max-age=60" } })
  }

  const products = await getRecentlyViewedProducts(slugs, exclude)
  return NextResponse.json({ products }, { headers: { "Cache-Control": "private, max-age=60" } })
}
