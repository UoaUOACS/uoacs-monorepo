import path from "node:path"
import { fileURLToPath } from "node:url"
import { withPayload } from "@payloadcms/next/withPayload"
import { noIndexHeaders, ProductionHostnames } from "@uoacs/shared/robots"
import type { NextConfig } from "next"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return noIndexHeaders(process.env.NEXT_PUBLIC_AUTH_URL, ProductionHostnames.AUTH)
  },
  output: "standalone",
  // Trace from the workspace root so standalone output resolves dependencies
  // hoisted to the monorepo's node_modules, not just this app's.
  outputFileTracingRoot: path.join(dirname, "../.."),
  // @uoacs/ui and @uoacs/shared export raw TypeScript source, so Next has to
  // compile them.
  transpilePackages: ["@uoacs/ui", "@uoacs/shared"],
  images: {
    localPatterns: [
      {
        pathname: "/payload/api/media/file/**",
      },
    ],
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
}

export default withPayload(nextConfig)
