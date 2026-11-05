"use server"

import { ValidationError } from "payload"
import sharp from "sharp"
import { getCurrentMember } from "@/features/member/member.queries"
import { MEDIA_MAX_BYTES, MEDIA_TYPES } from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import type { Media } from "@/payload/payload-types"

export type UploadProfilePictureResult =
  | { ok: true; id: Media["id"]; url: Media["url"] }
  | {
      ok: false
      error: "invalid" | "unauthenticated" | "unavailable" | "server"
      /**
       * Why the collection rejected the file
       */
      message?: string
    }

/**
 * The MIME type from the file's content, as the client's `file.type` can be anything. `null` when
 * it is not one of `MEDIA_TYPES`.
 */
const detectImageType = async (data: Buffer): Promise<string | null> => {
  const { format, compression } = await sharp(data)
    .metadata()
    .catch(() => ({ format: undefined, compression: undefined }))
  // sharp reports AVIF as HEIF with AV1 compression
  const type = format === "heif" && compression === "av1" ? "image/avif" : `image/${format}`
  return MEDIA_TYPES.includes(type) ? type : null
}

/**
 * Uploads a profile picture for the signed-in member. Saving its ID to their profile is left to
 * `editMember`, so a picture picked but never saved does not change the profile.
 *
 * @param formData `file`
 */
export async function uploadProfilePicture(
  formData: FormData,
): Promise<UploadProfilePictureResult> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size > MEDIA_MAX_BYTES) {
    return { ok: false, error: "invalid" }
  }

  try {
    const current = await getCurrentMember()
    if (current.status !== "authenticated") return { ok: false, error: current.status }
    const { firstName, lastName } = current.member

    const data = Buffer.from(await file.arrayBuffer())
    const mimetype = await detectImageType(data)
    if (!mimetype) return { ok: false, error: "invalid" }

    const payload = await getPayloadClient()
    const media = await payload.create({
      collection: Slugs.Collections.MEDIA,
      data: { alt: `${firstName} ${lastName}` },
      file: {
        data,
        mimetype,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true,
    })
    if (!media.url) throw new Error(`Media ${media.id} has no URL`)

    return { ok: true, id: media.id, url: media.url }
  } catch (error) {
    // Payload checks the file content again, and can refuse a file that sharp accepts
    if (error instanceof ValidationError) {
      console.warn("[uploadProfilePicture] The collection rejected the upload", { error })
      return { ok: false, error: "invalid", message: error.data.errors[0]?.message }
    }
    console.error("[uploadProfilePicture] Failed to upload the picture", { error })
    return { ok: false, error: "server" }
  }
}
