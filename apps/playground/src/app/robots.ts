import { isProductionUrl, ProductionHostnames } from "@uoacs/shared/robots"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  if (!isProductionUrl(process.env.NEXT_PUBLIC_PROJECTS_URL, ProductionHostnames.PLAYGROUND)) {
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
  }
}
