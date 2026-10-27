import type { StorybookConfig } from "@storybook/nextjs-vite"

/**
 * Placeholders so components that call `authPageUrl()` render in Storybook
 * when these are not set. The Next.js env plugin defines the same keys from
 * the real env and `.env` files, and its value wins over the value here.
 */
const PLACEHOLDER_PUBLIC_ENV = {
  NEXT_PUBLIC_AUTH_URL: "http://localhost:3002",
  NEXT_PUBLIC_PROJECTS_URL: "http://localhost:3001",
}

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: (viteConfig) => {
    const placeholders = Object.fromEntries(
      Object.entries(PLACEHOLDER_PUBLIC_ENV).map(([key, value]) => [
        `process.env.${key}`,
        JSON.stringify(value),
      ]),
    )
    viteConfig.define = { ...placeholders, ...viteConfig.define }

    // `sb.mock` in preview.ts replaces the server actions that import Payload,
    // but only once a module is transformed. Vite's dependency optimizer walks
    // the real imports before that and fails to pre-bundle Payload, which takes
    // the whole preview with it, so it must not try.
    viteConfig.optimizeDeps ??= {}
    viteConfig.optimizeDeps.exclude = [...(viteConfig.optimizeDeps.exclude ?? []), "payload"]
    return viteConfig
  },
}

export default config
