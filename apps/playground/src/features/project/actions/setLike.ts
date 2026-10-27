"use server"

import { updateTag } from "next/cache"
import { ValidationError, type Where } from "payload"
import { z } from "zod"
import { getCurrentMember } from "@/features/member/member.queries"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import { getRelationID } from "@/lib/payload/getRelationID"

export type SetLikeResult =
  | { ok: true; liked: boolean }
  | { ok: false; error: string; reason?: "unauthenticated" }

// The Like hooks refresh these in the background, which would pair the member's new heart with the
// old count, so expire them now for the member who liked
const expireLikeState = (memberID: string, projectID: string, authorID: string) => {
  updateTag(CacheTags.MEMBERS.LIKES(memberID))
  updateTag(CacheTags.PROJECTS.ID(projectID))
  updateTag(CacheTags.PROJECTS.AUTHOR(authorID))
  updateTag(CacheTags.PROJECTS.ROOT)
}

const inputSchema = z.object({
  projectID: z.string().regex(/^[a-f\d]{24}$/i),
  liked: z.boolean(),
})

/**
 * Likes or unlikes a project for the signed-in member
 *
 * Sets the state the member asked for rather than toggling, so a card that shows stale state
 * still does what the member saw, and a repeated call changes nothing.
 */
export async function setLike(projectID: string, liked: boolean): Promise<SetLikeResult> {
  const parsed = inputSchema.safeParse({ projectID, liked })
  if (!parsed.success) return { ok: false, error: "Project not found" }
  const { projectID: id } = parsed.data

  try {
    const result = await getCurrentMember()
    if (result.status === "unavailable")
      return { ok: false, error: "Something went wrong. Try again." }
    if (result.status === "unauthenticated")
      return { ok: false, error: "Log in to like projects", reason: "unauthenticated" }
    const { member } = result

    const payload = await getPayloadClient()
    const where: Where = { project: { equals: id }, member: { equals: member.id } }

    const project = await payload.findByID({
      collection: Slugs.Collections.PROJECT,
      id,
      select: { author: true },
      depth: 0,
      disableErrors: true,
    })
    if (!project) return { ok: false, error: "Project not found" }
    const authorID = getRelationID(project.author)

    if (!parsed.data.liked) {
      const removed = await payload.delete({ collection: Slugs.Collections.LIKE, where, depth: 0 })
      // A bulk delete reports a failed doc here rather than throwing
      if (removed.errors.length > 0) {
        throw new Error(`Failed to delete like: ${removed.errors[0].message}`)
      }
      expireLikeState(member.id, id, authorID)
      return { ok: true, liked: false }
    }

    try {
      await payload.create({
        collection: Slugs.Collections.LIKE,
        data: { project: id, member: member.id },
        depth: 0,
      })
    } catch (err) {
      // The unique index refuses a like that already exists, which is the state asked for
      if (!(err instanceof ValidationError)) throw err
      const { totalDocs } = await payload.count({ collection: Slugs.Collections.LIKE, where })
      if (totalDocs === 0) throw err
    }

    expireLikeState(member.id, id, authorID)
    return { ok: true, liked: true }
  } catch (err) {
    console.error("[setLike] failed to set like", { error: err, projectID: id, liked })
    return { ok: false, error: "Something went wrong. Try again." }
  }
}
