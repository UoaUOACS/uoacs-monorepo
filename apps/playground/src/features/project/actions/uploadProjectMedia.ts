"use server"

import { ValidationError } from "payload"
import sharp from "sharp"
import { getCurrentMember } from "@/features/member/member.queries"
import {
  IMAGE_TITLE_MAX_LENGTH,
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
} from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import type { ProjectMedia } from "@/payload/payload-types"

export type UploadMediaResult =
  | {
      ok: true
      id: ProjectMedia["id"]
      url: ProjectMedia["url"]
      alt: ProjectMedia["alt"]
      width: ProjectMedia["width"] | null
      height: ProjectMedia["height"] | null
    }
  | {
      ok: false
      error: "invalid" | "unauthenticated" | "unavailable" | "server"
      /**
       * Why the collection rejected the file, e.g. its size in px is too small
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
 * Uploads one image for the signed-in member's project
 *
 * @param formData `file`, and an optional `alt` that defaults to the file name
 */
export async function uploadProjectMedia(formData: FormData): Promise<UploadMediaResult> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size > MEDIA_MAX_BYTES) {
    return { ok: false, error: "invalid" }
  }
  const alt = formData.get("alt")

  try {
    const current = await getCurrentMember()
    if (current.status !== "authenticated") return { ok: false, error: current.status }
    const memberID = current.member.id

    const data = Buffer.from(await file.arrayBuffer())
    const mimetype = await detectImageType(data)
    if (!mimetype) return { ok: false, error: "invalid" }

    const payload = await getPayloadClient()
    const media = await payload.create({
      collection: Slugs.Collections.PROJECT_MEDIA,
      data: {
        // `|| file.name` keeps a name like `.png` from becoming an empty, required alt
        alt: (typeof alt === "string" && alt.trim()
          ? alt.trim()
          : file.name.replace(/\.[^.]+$/, "") || file.name
        ).slice(0, IMAGE_TITLE_MAX_LENGTH),
        uploadedBy: memberID,
      },
      file: {
        data,
        mimetype,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true,
    })
    if (!media.url) throw new Error(`Media ${media.id} has no URL`)

    return {
      ok: true,
      id: media.id,
      url: media.url,
      alt: media.alt,
      width: media.width ?? null,
      height: media.height ?? null,
    }
  } catch (error) {
    // Payload checks the file content again, and can refuse a file that sharp accepts
    if (error instanceof ValidationError) {
      console.warn("[uploadMedia] The collection rejected the upload", { error })
      return { ok: false, error: "invalid", message: error.data.errors[0]?.message }
    }
    console.error("[uploadMedia] Failed to upload the image", { error })
    return { ok: false, error: "server" }
  }
}
