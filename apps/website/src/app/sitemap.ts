import { isProductionUrl, ProductionHostnames } from "@uoacs/shared/robots"
import type { MetadataRoute } from "next"
import { Routes } from "@/lib/routes"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL

  if (!isProductionUrl(baseUrl, ProductionHostnames.WEBSITE)) {
    return []
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseUrl}${Routes.TEAM}`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}${Routes.EVENTS}`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}${Routes.SPONSORS}`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}${Routes.PRIVACY}`,
      lastModified: new Date(),
      priority: 0.5,
    },
  ]
}
