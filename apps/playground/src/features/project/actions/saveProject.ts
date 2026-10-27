"use server"

import { updateTag } from "next/cache"
import { type Payload, ValidationError } from "payload"
import { getCurrentMember } from "@/features/member/member.queries"
import { toFieldErrors } from "@/features/project/helpers/fieldErrors"
import { editProjectSchema } from "@/features/project/schemas/EditProject.schema"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import { getRelationID } from "@/lib/payload/getRelationID"

/**
 * Saves changed titles as the alt text of the member's own images
 */
const saveImageTitles = async (
  payload: Payload,
  memberID: string,
  imageTitles: Record<string, string>,
) => {
  const ids = Object.keys(imageTitles)
  if (ids.length === 0) return
  const { docs } = await payload.find({
    collection: Slugs.Collections.PROJECT_MEDIA,
    where: { id: { in: ids }, uploadedBy: { equals: memberID } },
    select: { alt: true },
    depth: 0,
    pagination: false,
  })
  await Promise.all(
    docs
      .filter((media) => media.alt !== imageTitles[media.id])
      .map((media) =>
        payload.update({
          collection: Slugs.Collections.PROJECT_MEDIA,
          id: media.id,
          data: { alt: imageTitles[media.id] },
          depth: 0,
          overrideAccess: true,
        }),
      ),
  )
}

export type SaveProjectResult =
  | { ok: true; id: string }
  | {
      ok: false
      error: "invalid" | "unauthenticated" | "unavailable" | "not-found" | "server"
      /**
       * Messages keyed by TanStack Form field path, e.g. `pageContent[3].content`
       */
      fieldErrors?: Record<string, string>
    }

/**
 * Creates a project for the signed-in member, or updates one of their own when `id` is given
 */
export async function saveProject(input: unknown): Promise<SaveProjectResult> {
  let id: string | undefined
  try {
    // Inside the try, so a refine that throws on odd input gives a result, not a crash
    const parsed = editProjectSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: "invalid", fieldErrors: toFieldErrors(parsed.error.issues) }
    }
    const { id: projectID, imageTitles, ...data } = parsed.data
    id = projectID

    const current = await getCurrentMember()
    if (current.status !== "authenticated") return { ok: false, error: current.status }
    const memberID = current.member.id

    const payload = await getPayloadClient()

    if (!id) {
      // Titles first, so a failed title save cannot leave a new project the client has no ID for
      await saveImageTitles(payload, memberID, imageTitles)
      // create the project rather than update
      const created = await payload.create({
        collection: Slugs.Collections.PROJECT,
        data: { ...data, author: memberID },
        depth: 0,
        overrideAccess: true,
      })
      updateTag(CacheTags.PROJECTS.AUTHOR(memberID))
      return { ok: true, id: created.id }
    }

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

    await payload.update({
      collection: Slugs.Collections.PROJECT,
      id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    await saveImageTitles(payload, memberID, imageTitles)
    updateTag(CacheTags.PROJECTS.ID(id))
    updateTag(CacheTags.PROJECTS.AUTHOR(memberID))
    return { ok: true, id }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.warn("[saveProject] The collection rejected input the schema allowed", { error })
      return { ok: false, error: "invalid" }
    }
    console.error("[saveProject] Failed to save the project", { error, id })
    return { ok: false, error: "server" }
  }
}
