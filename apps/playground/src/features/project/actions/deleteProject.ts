"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentMember } from "@/features/member/member.queries"
import { objectIDSchema } from "@/features/project/schemas/objectID.schema"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Routes } from "@/lib/routes"

export type DeleteProjectResult = {
  ok: false
  error: "unauthenticated" | "unavailable" | "not-found" | "server"
}

/**
 * Deletes one of the signed-in member's projects, then redirects to their profile
 *
 * The collection's `deleteLikes` hook removes the project's likes.
 */
export async function deleteProject(id: string): Promise<DeleteProjectResult> {
  if (!objectIDSchema.safeParse(id).success) return { ok: false, error: "not-found" }

  try {
    const current = await getCurrentMember()
    if (current.status !== "authenticated") return { ok: false, error: current.status }
    const memberID = current.member.id

    const payload = await getPayloadClient()
    const existing = await payload.findByID({
      collection: Slugs.Collections.PROJECT,
      id,
      select: { author: true },
      depth: 0,
      disableErrors: true,
    })
    if (!existing || getRelationID(existing.author) !== memberID) {
      return { ok: false, error: "not-found" }
    }

    await payload.delete({
      collection: Slugs.Collections.PROJECT,
      id,
      depth: 0,
      overrideAccess: true,
    })
    updateTag(CacheTags.PROJECTS.ID(id))
    updateTag(CacheTags.PROJECTS.AUTHOR(memberID))
  } catch (error) {
    console.error("[deleteProject] Failed to delete the project", { error, id })
    return { ok: false, error: "server" }
  }

  // Outside the try, as redirect works by throwing
  redirect(Routes.PROFILE.ROOT)
}
