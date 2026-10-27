<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UOACS monorepo

pnpm + Turborepo monorepo. See `README.md` for setup and each app/package README for details.

## Apps

| App | Next.js | Cache Components | Caching approach |
|---|---|---|---|
| `apps/website` | 16.4 | No | Route segment config, Payload revalidate hooks, TanStack Query |
| `apps/playground` | 16.4 | Yes (`cacheComponents: true`) | `"use cache"` + `cacheTag`/`cacheLife`, tags in `@/lib/cache` |
| `apps/auth` | 16.4 | No | Dynamic; owns the Better Auth session |

- Check the app's row before using caching APIs: `"use cache"`, `cacheLife` and `cacheTag` only work in playground.
- All apps run the React Compiler, so don't add `useMemo`, `useCallback` or `memo` for performance.

## Commands (from repo root)

- `pnpm types:check`: type check everything (regenerates Payload types first)
- `pnpm lint:fix`: Biome lint and format
- `pnpm turbo run <task> --filter @uoacs/<name>`: run a task for one package

## Conventions

- Follow the patterns in the surrounding code before introducing new ones: file layout, naming, comment density.
- Biome owns formatting (double quotes, no semicolons, 100 columns), so don't hand-format.
- Don't edit generated `payload-types.ts` files; run `pnpm types:generate` instead.
- Pin shared dependency versions in the `pnpm-workspace.yaml` catalog, not in a `package.json`.
- Shared UI goes in `packages/ui` (no app imports there); shared non-UI code goes in `packages/shared`.
- Packages ship raw TypeScript, so there is no package build step.
- Commits use Conventional Commits; branch names follow `CONTRIBUTING.md`.
- Don't read or edit `.env` files; `.env.example` lists the variables each app needs.
- For Payload work, follow `.agents/skills/payload/SKILL.md`.

## Keep it simple

- Do what was asked in the simplest way that fits this repo's conventions and the user's expectations.
- Don't add features, abstractions, config options, files or refactors that weren't requested. Mention them at the end instead.
- Before reporting done, run a real check on what you changed (`pnpm types:check`, the app's build, or its Storybook tests), or say which check you couldn't run.
