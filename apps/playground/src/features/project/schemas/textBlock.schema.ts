import { countRichTextCharacters } from "@uoacs/shared"
import { richTextSchema } from "@uoacs/shared/payload"
import { z } from "zod"
import { TEXT_BLOCK_MAX_CHARACTERS } from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload/slugs"
import { objectIDSchema } from "./objectID.schema"

export const textBlockSchema = z.object({
  id: objectIDSchema.optional(),
  blockType: z.literal(Slugs.Blocks.TEXT),
  content: richTextSchema
    .refine((value) => countRichTextCharacters(value) > 0, "Add some text")
    .refine(
      (value) => countRichTextCharacters(value) <= TEXT_BLOCK_MAX_CHARACTERS,
      `Text must be ${TEXT_BLOCK_MAX_CHARACTERS} characters or fewer`,
    ),
})
