import { z } from "zod"
import {
  IMAGE_TITLE_MAX_LENGTH,
  PROJECT_MAX_BLOCKS,
  PROJECT_SUMMARY_MAX_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "@/features/project/project.constants"
import { imageGridBlockSchema } from "./imageGridBlock.schema"
import { objectIDSchema } from "./objectID.schema"
import { textBlockSchema } from "./textBlock.schema"

/**
 * What a member may save on their own project, mirroring the collection's rules. Runs on the
 * server only, to keep zod out of the editor bundle. Unknown keys, like the editor's `_key`, are
 * dropped.
 */
export const editProjectSchema = z.object({
  id: objectIDSchema.optional(), // Omitted when the project is new
  name: z.string().trim().min(1, "Add a title").max(PROJECT_TITLE_MAX_LENGTH),
  summary: z.string().trim().min(1, "Add a summary").max(PROJECT_SUMMARY_MAX_LENGTH),
  coverImage: z.string("Add a cover image").pipe(objectIDSchema),
  pageContent: z
    .array(z.discriminatedUnion("blockType", [textBlockSchema, imageGridBlockSchema]))
    .min(1, "Add at least one section")
    .max(PROJECT_MAX_BLOCKS, `A project can have ${PROJECT_MAX_BLOCKS} sections or fewer`),
  // By Media ID. Saved as each image's alt text.
  imageTitles: z
    .record(objectIDSchema, z.string().trim().min(1, "Add a title").max(IMAGE_TITLE_MAX_LENGTH))
    .default({}),
})

export type EditProjectInput = z.infer<typeof editProjectSchema>
