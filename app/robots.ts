import type { MetadataRoute } from "next"
import { SITE } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/admin",
          "/api/",
          "/cart",
          "/checkout",
          "/search",
          "/sign-in",
          "/sign-up",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
