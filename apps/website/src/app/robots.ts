import { isProductionUrl, ProductionHostnames } from "@uoacs/shared/robots"
import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL

  if (!isProductionUrl(baseUrl, ProductionHostnames.WEBSITE)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/payload/admin/", "/payload/api/", "/api/", "/profile/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
