import { AuthApiRoutes } from "@uoacs/shared"
import { getSession, sessionFetch } from "@uoacs/shared/auth/server"
import { cacheLife, cacheTag } from "next/cache"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"
import { after } from "next/server"
import { cache } from "react"
import { z } from "zod"
import { createMember, syncNames } from "@/features/member/member.mutations"
import type { CurrentMemberResult } from "@/features/member/member.types"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import type { Member } from "@/payload/payload-types"

const authNamesSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export type AuthNames = z.infer<typeof authNamesSchema>

/**
 * The session carries only the email, so names come from the auth service.
 * `null` means "could not find out", never "has no name", so callers fall back
 * to the stored copy rather than locking everyone out.
 */
async function fetchCurrentMemberNames(): Promise<AuthNames | null> {
  let body: unknown
  try {
    const response = await sessionFetch(AuthApiRoutes.MEMBER_ME, await headers(), {
      signal: AbortSignal.timeout(5000),
    })
    // Signed in with no member behind the account: a stuck account rather than
    // an outage, so it is not logged as one.
    if (response.status === 404) {
      console.warn("[getCurrentMember] Signed in but the auth service has no member")
      return null
    }
    if (!response.ok) {
      console.error("[getCurrentMember] Auth service answered with an error", {
        status: response.status,
      })
      return null
    }
    body = await response.json()
  } catch (err) {
    unstable_rethrow(err)
    console.error("[getCurrentMember] Failed to reach the auth service", { error: err })
    return null
  }

  const parsed = authNamesSchema.safeParse(body)
  if (!parsed.success) {
    console.error("[getCurrentMember] Auth service returned something without a name", {
      issues: parsed.error.issues.map((issue) => issue.path.join(".")),
    })
    return null
  }
  return parsed.data
}

async function findMemberByBetterAuthUserId(betterAuthUserId: string): Promise<Member | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: Slugs.Collections.MEMBER,
    where: { betterAuthUserId: { equals: betterAuthUserId } },
    limit: 1,
  })
  return docs[0] ?? null
}

/**
 * The playground member for whoever is signed in, created on their first visit
 * so every logged-in person has a profile without signing up a second time.
 * Deduplicated per request, as a page may read it in more than one place.
 */
export const getCurrentMember = cache(async (): Promise<CurrentMemberResult> => {
  const session = await getSession()
  if (session.status !== "authenticated") return session

  const betterAuthUserId = session.session.user.id
  // The names are only a refresh, so a failing auth service must not keep
  // someone out of a member we already have.
  const [existing, names] = await Promise.all([
    findMemberByBetterAuthUserId(betterAuthUserId),
    fetchCurrentMemberNames(),
  ])

  if (existing) {
    after(async () => {
      try {
        await syncNames(existing, names)
      } catch (error) {
        console.error("[getCurrentMember] Failed to sync the stored names", { error })
      }
    })
    return { status: "authenticated", member: existing }
  }

  // Creating one is the only step that cannot proceed without a name.
  if (!names) return { status: "unavailable" }

  try {
    return { status: "authenticated", member: await createMember(betterAuthUserId, names) }
  } catch (err) {
    // Another request for the same person may have created it first, so ask the
    // database rather than reading the failure. If it did not, this was a real
    // error and belongs to the caller.
    const raced = await findMemberByBetterAuthUserId(betterAuthUserId)
    if (!raced) throw err
    return { status: "authenticated", member: raced }
  }
})

export const getMemberByUsernameCached = async (username: string): Promise<Member | null> => {
  "use cache"
  cacheTag(CacheTags.MEDIA)
  cacheLife("max")
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: Slugs.Collections.MEMBER,
    where: { username: { equals: username } },
    limit: 1,
  })
  const member = docs[0] ?? null
  if (member) cacheTag(CacheTags.MEMBERS.ID(member.id))
  return member
}
