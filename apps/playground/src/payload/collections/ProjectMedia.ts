import { imageResizeOptions, makeImageDimensionsHook } from "@uoacs/shared/payload"
import type { CollectionConfig, FilterOptions } from "payload"
import {
  IMAGE_TITLE_MAX_LENGTH,
  MEDIA_MAX_ASPECT_RATIO,
  MEDIA_MIN_DIMENSION,
  MEDIA_TYPES,
} from "@/features/project/project.constants"
import { CacheTags } from "@/lib/cache"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Slugs } from "@/lib/payload/slugs"
import { makeRevalidateHooks } from "../hooks/revalidate"

const { afterChange, afterDelete } = makeRevalidateHooks([CacheTags.MEDIA], { skipCreate: true })

/**
 * Limits a project's image fields to images its author uploaded. Payload also checks this on
 * every save, so a member cannot use another member's image.
 */
export const authorsProjectMedia: FilterOptions = ({ data }) =>
  data?.author ? { uploadedBy: { equals: getRelationID(data.author) } } : false

export const ProjectMedia: CollectionConfig = {
  slug: Slugs.Collections.PROJECT_MEDIA,
  admin: {
    description: "Images that members upload for their projects",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      maxLength: IMAGE_TITLE_MAX_LENGTH,
    },
    {
      name: "uploadedBy",
      type: "relationship",
      relationTo: Slugs.Collections.MEMBER,
      required: true,
      index: true,
      admin: { position: "sidebar" },
    },
  ],
  // Payload then checks the file's content, not only the type the client sends
  upload: { mimeTypes: MEDIA_TYPES, resizeOptions: imageResizeOptions },
  hooks: {
    beforeValidate: [
      makeImageDimensionsHook({ minSide: MEDIA_MIN_DIMENSION, maxRatio: MEDIA_MAX_ASPECT_RATIO }),
    ],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
}
