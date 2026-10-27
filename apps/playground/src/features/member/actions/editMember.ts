"use server"

import { ValidationError } from "payload"
import { isUsernameClash } from "@/features/member/member.mutations"
import { getCurrentMember } from "@/features/member/member.queries"
import { editMemberSchema } from "@/features/member/schemas/editMember.schema"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"

export type EditMemberResult =
  | { ok: true }
  | {
      ok: false
      error: "invalid" | "username-taken" | "unauthenticated" | "unavailable" | "server"
    }

/**
 * Replaces the signed-in person's own profile fields. The member comes from the
 * session, never the input, so this is the check that the collection's
 * admin-only update would be — hence `overrideAccess`, which also lifts the
 * read access hiding `betterAuthUserId`, so nothing is returned.
 */
export async function editMember(input: unknown): Promise<EditMemberResult> {
  const parsed = editMemberSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }

  try {
    const current = await getCurrentMember()
    if (current.status !== "authenticated") return { ok: false, error: current.status }

    const payload = await getPayloadClient()
    await payload.update({
      collection: Slugs.Collections.MEMBER,
      id: current.member.id,
      data: parsed.data,
      overrideAccess: true,
    })
    return { ok: true }
  } catch (error) {
    // The schema cannot know which usernames are taken, so this one is expected
    if (isUsernameClash(error)) return { ok: false, error: "username-taken" }
    // The schema mirrors the collection, so a rejection here means the two have
    // drifted rather than that the caller sent something the schema caught.
    if (error instanceof ValidationError) {
      console.warn("[editMember] The collection rejected input the schema allowed", { error })
      return { ok: false, error: "invalid" }
    }
    console.error("[editMember] Failed to edit the member", { error })
    return { ok: false, error: "server" }
  }
}
