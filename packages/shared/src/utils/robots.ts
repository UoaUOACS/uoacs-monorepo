import type { NextConfig } from "next"

type Header = Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>[number]

export const ProductionHostnames = {
  WEBSITE: "uoacs.co.nz",
  AUTH: "auth.uoacs.co.nz",
  PLAYGROUND: "projects.uoacs.co.nz",
} as const

/** Whether `appUrl` points at `productionHostname`, which marks a production build. */
export function isProductionUrl(
  appUrl: string | undefined,
  productionHostname: string,
): appUrl is string {
  if (!appUrl) return false
  try {
    return new URL(appUrl).hostname === productionHostname
  } catch {
    return false
  }
}

/**
 * Header rules for `next.config.ts` that add `X-Robots-Tag: noindex` to every response of a
 * staging build. A production build adds it only on other hosts, such as `*.fly.dev`.
 */
export function noIndexHeaders(appUrl: string | undefined, productionHostname: string): Header[] {
  const headers = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  if (!isProductionUrl(appUrl, productionHostname)) {
    return [{ source: "/:path*", headers }]
  }
  return [{ source: "/:path*", missing: [{ type: "host", value: productionHostname }], headers }]
}
