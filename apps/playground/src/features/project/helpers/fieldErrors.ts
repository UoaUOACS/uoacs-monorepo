import type { z } from "zod"

/**
 * Maps zod issues to TanStack Form field paths, e.g. `["pageContent", 3, "content"]` to
 * `pageContent[3].content`. Keeps the first message for each field and skips form-level issues.
 */
export const toFieldErrors = (issues: z.core.$ZodIssue[]): Record<string, string> => {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    if (issue.path.length === 0) continue
    const path = issue.path
      .map((key, index) =>
        typeof key === "number" ? `[${key}]` : `${index === 0 ? "" : "."}${String(key)}`,
      )
      .join("")
    errors[path] ??= issue.message
  }
  return errors
}
