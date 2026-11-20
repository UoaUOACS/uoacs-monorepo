import { AuthApiRoutes, type AuthUser, memberResponseSchema } from "@uoacs/shared"
import { getSession, sessionFetch } from "@uoacs/shared/auth/server"
import type { Member as AuthMember } from "@uoacs/shared/payload"
import { cacheLife, cacheTag } from "next/cache"
import { headers } from "next/headers"
import { after } from "next/server"
import { cache } from "react"
import { createMember, syncNames } from "@/features/member/member.mutations"
import type { CurrentMemberResult } from "@/features/member/member.types"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import type { Member } from "@/payload/payload-types"

export type AuthNames = { firstName: string; lastName: string }

/**
 * `null` means the auth user has no names yet, so callers fall back to the
 * stored copy rather than locking everyone out.
 */
function namesFromSession({ firstName, lastName }: AuthUser): AuthNames | null {
  return firstName && lastName ? { firstName, lastName } : null
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

  const { user } = session.session
  const betterAuthUserId = user.id
  // The names are only a refresh, so missing ones must not keep someone out of
  // a member we already have.
  const names = namesFromSession(user)
  const existing = await findMemberByBetterAuthUserId(betterAuthUserId)

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
  if (!names) {
    // Names are synced from the member, so none means a stuck account rather
    // than an outage, and it is not logged as one.
    console.warn("[getCurrentMember] Signed in but the auth user has no names")
    return { status: "unavailable" }
  }

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
  // Tagged even when no one has it, so taking the username shows its new profile
  cacheTag(CacheTags.MEDIA, CacheTags.MEMBERS.USERNAME(username))
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

/**
 * The signed-in person's own auth app member.
 * `null` means not signed in or no member; any other failure throws.
 */
export const getAuthMember = cache(async (): Promise<AuthMember | null> => {
  const response = await sessionFetch(AuthApiRoutes.MEMBER_ME, await headers(), {
    signal: AbortSignal.timeout(5000),
  })
  if (response.status === 401 || response.status === 404) return null
  if (!response.ok) {
    throw new Error(`[getAuthMember] Auth service answered with ${response.status}`)
  }
  return memberResponseSchema.parse(await response.json())
})
