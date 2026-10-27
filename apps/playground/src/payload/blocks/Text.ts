import { countRichTextCharacters } from "@uoacs/shared"
import type { Block } from "payload"
import { richText } from "payload/shared"
import { TEXT_BLOCK_MAX_CHARACTERS } from "@/features/project/project.constants"
import { Slugs } from "@/lib/payload/slugs"

export const Text: Block = {
  slug: Slugs.Blocks.TEXT,
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
      validate: async (value, options) => {
        // A custom validate replaces the editor's own, so run it first
        const result = await richText(value, options)
        if (result !== true || !value) return result
        return countRichTextCharacters(value) <= TEXT_BLOCK_MAX_CHARACTERS
          ? true
          : `Text must be ${TEXT_BLOCK_MAX_CHARACTERS} characters or fewer`
      },
    },
  ],
}
