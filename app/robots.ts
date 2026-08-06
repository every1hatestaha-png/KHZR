import type { MetadataRoute } from "next"
import { SITE } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/cart",
          "/checkout",
          "/search",
          "/sign-in",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
