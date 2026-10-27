import "server-only"
import type { SessionResult } from "@uoacs/shared"
import { getSession } from "@uoacs/shared/auth/server"
import { redirectToLogin } from "./auth.helpers"

/** A required session never reports "unauthenticated": that case redirects. */
export type RequiredSessionResult = Exclude<SessionResult, { status: "unauthenticated" }>

/**
 * Session for a page that needs login, sending a logged-out visitor to the
 * hosted login page and back to `path` once they are done.
 *
 * `unavailable` is returned rather than redirected, because the person may well
 * be signed in: sending them to log in would report an outage as a logged-out
 * state and lose their place. Callers render `SessionUnavailable` instead.
 */
export async function requireSession(path: string): Promise<RequiredSessionResult> {
  const result = await getSession()
  if (result.status === "unauthenticated") redirectToLogin(path)
  return result
}
