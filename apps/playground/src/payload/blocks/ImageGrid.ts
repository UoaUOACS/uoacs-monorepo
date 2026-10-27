import type { Block } from "payload"
import { IMAGE_GRID_MAX_IMAGES } from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload/slugs"
import { authorsProjectMedia } from "../collections/ProjectMedia"

export const ImageGrid: Block = {
  slug: Slugs.Blocks.IMAGE_GRID,
  fields: [
    {
      name: "images",
      type: "upload",
      relationTo: Slugs.Collections.PROJECT_MEDIA,
      hasMany: true,
      required: true,
      maxRows: IMAGE_GRID_MAX_IMAGES,
      filterOptions: authorsProjectMedia,
    },
  ],
}
