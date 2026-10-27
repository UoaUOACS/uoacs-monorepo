import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from "@payloadcms/richtext-lexical"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { z } from "zod"

// Only the features RichTextEditor (@uoacs/ui) can edit. It cannot load other nodes.
// Keep in sync with packages/ui/src/components/RichTextEditor/nodes.ts.
export const richTextFeatures = [
  ParagraphFeature(),
  HeadingFeature(),
  BlockquoteFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  AlignFeature(),
  InlineToolbarFeature(),
]

/**
 * Rich text as Payload saves it and RichTextEditor (@uoacs/ui) edits it
 */
export type RichTextValue = SerializedEditorState & { [key: string]: unknown }

/**
 * Checks only the outer shape of saved rich text. Payload's editor validation checks the nodes.
 */
export const richTextSchema = z.custom<RichTextValue>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "root" in value &&
    typeof value.root === "object" &&
    value.root !== null &&
    "children" in value.root &&
    Array.isArray(value.root.children),
  "Invalid rich text",
)
