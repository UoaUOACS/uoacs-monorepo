import path from "node:path"
import { fileURLToPath } from "node:url"
import { withPayload } from "@payloadcms/next/withPayload"
import { noIndexHeaders, ProductionHostnames } from "@uoacs/shared/robots"
import type { NextConfig } from "next"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return noIndexHeaders(process.env.NEXT_PUBLIC_PROJECTS_URL, ProductionHostnames.PLAYGROUND)
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Room for one image upload through the uploadMedia action
    serverActions: { bodySizeLimit: "5mb" },
  },
  output: "standalone",
  // Trace from the workspace root so standalone output resolves dependencies
  // hoisted to the monorepo's node_modules, not just this app's.
  outputFileTracingRoot: path.join(dirname, "../.."),
  transpilePackages: ["@uoacs/ui", "@uoacs/shared"],
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    localPatterns: [{ pathname: "/**" }],
    remotePatterns: [{ hostname: "cdn.discordapp.com" }],
  },
}

export default withPayload(nextConfig)
