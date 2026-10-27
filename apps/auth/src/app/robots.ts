import { isProductionUrl, ProductionHostnames } from "@uoacs/shared/robots"
import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  if (!isProductionUrl(process.env.NEXT_PUBLIC_AUTH_URL, ProductionHostnames.AUTH)) {
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
        disallow: ["/payload/admin/", "/payload/api/", "/api/"],
      },
    ],
  }
}
