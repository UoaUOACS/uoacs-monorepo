import { notFound } from "next/navigation"

// Catch-all so unmatched URLs use this group's layout and `not-found.tsx`, not Next's default 404.
// Always throws, so there is no shell for instant-navigation validation to check.
export const instant = false

export default function CatchAll() {
  notFound()
}
