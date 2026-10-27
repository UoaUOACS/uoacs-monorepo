import { z } from "zod"
import { IMAGE_GRID_MAX_IMAGES } from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload/slugs"
import { objectIDSchema } from "./objectID.schema"

export const imageGridBlockSchema = z.object({
  id: objectIDSchema.optional(),
  blockType: z.literal(Slugs.Blocks.IMAGE_GRID),
  images: z
    .array(objectIDSchema)
    .min(1, "Add at least one image")
    .max(IMAGE_GRID_MAX_IMAGES, `Add ${IMAGE_GRID_MAX_IMAGES} images or fewer`),
})
