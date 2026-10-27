import { type AnyFormApi, formOptions } from "@tanstack/react-form"
import { countRichTextCharacters } from "@uoacs/shared"
import type { RichTextValue } from "@uoacs/shared/payload"
import type { GalleryImage } from "@uoacs/ui"
import { toGalleryImages } from "@uoacs/ui/utils"
import type { z } from "zod"
import type { editProjectSchema } from "@/features/project/schemas/EditProject.schema"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Slugs } from "@/lib/payload/slugs"
import type { Project } from "@/payload/payload-types"

/**
 * `_key` is a client-only React key: the Payload block `id` for saved blocks, a new UUID
 * otherwise. Never key blocks by index, as a reorder would remount their editors.
 */
export type TextBlockValue = {
  _key: string
  id?: string
  blockType: typeof Slugs.Blocks.TEXT
  content: RichTextValue | null
}

export type ImageGridBlockValue = {
  _key: string
  id?: string
  blockType: typeof Slugs.Blocks.IMAGE_GRID
  images: string[] // Media IDs
}

export type BlockValue = TextBlockValue | ImageGridBlockValue

export type EditProjectValues = {
  name: string
  summary: string
  coverImage: string | null // Media ID
  pageContent: BlockValue[]
  /**
   * Image grid titles by Media ID, saved as each image's alt text
   */
  imageTitles: Record<string, string>
}

const defaultValues: EditProjectValues = {
  name: "",
  summary: "",
  coverImage: null,
  pageContent: [],
  imageTitles: {},
}

export const projectFormOptions = formOptions({ defaultValues })

/**
 * Sets a failed save's messages keyed by field path, or clears them when called with none. Uses
 * `onServer`, as TanStack clears `onSubmit` errors on the next change or blur, and they should
 * stay until the next save.
 */
export const setSaveErrors = (form: AnyFormApi, fields: Record<string, string> = {}) => {
  // Includes paths with no mounted field, like closed blocks
  for (const name of new Set([...Object.keys(form.state.fieldMeta), ...Object.keys(fields)])) {
    form.setFieldMeta(name, (meta) => ({
      ...meta,
      errorMap: { ...meta?.errorMap, onServer: fields[name] },
      errorSourceMap: { ...meta?.errorSourceMap, onServer: fields[name] ? "form" : undefined },
    }))
  }
}

export const createBlock = (blockType: BlockValue["blockType"]): BlockValue => {
  const _key = crypto.randomUUID()
  return blockType === Slugs.Blocks.TEXT
    ? { _key, blockType, content: null }
    : { _key, blockType, images: [] }
}

/**
 * A text block with no text, or an image grid with no images. Save skips these.
 */
export const isEmptyBlock = (block: BlockValue) =>
  block.blockType === Slugs.Blocks.TEXT
    ? !block.content || countRichTextCharacters(block.content) === 0
    : block.images.length === 0

/**
 * Maps a saved project, as `getEditableProject` returns it, to form values
 */
export const toFormValues = (project: Project): EditProjectValues => ({
  name: project.name,
  summary: project.summary,
  coverImage: getRelationID(project.coverImage),
  pageContent: project.pageContent.map((block): BlockValue => {
    const id = block.id ?? undefined
    const _key = id ?? crypto.randomUUID()
    return block.blockType === Slugs.Blocks.TEXT
      ? { _key, id, blockType: block.blockType, content: block.content }
      : { _key, id, blockType: block.blockType, images: block.images.map(getRelationID) }
  }),
  imageTitles: Object.fromEntries(
    Object.values(toMediaLookup(project)).map((image) => [image.id, image.alt]),
  ),
})

/**
 * Images by Media ID, so image grids can show the images for the IDs that the form holds
 */
export type MediaLookup = Record<string, GalleryImage>

/**
 * The images of a saved project's image grids, as `getEditableProject` populates them
 */
export const toMediaLookup = (project: Project): MediaLookup =>
  Object.fromEntries(
    project.pageContent
      .flatMap((block) =>
        block.blockType === Slugs.Blocks.IMAGE_GRID ? toGalleryImages(block.images) : [],
      )
      .map((image) => [image.id, image]),
  )

/**
 * The input for `saveProject`. Drops `_key` and keeps `id`, so Payload keeps existing blocks.
 * Sends only changed titles of images in a grid, so an old, too-long title cannot block a save.
 */
export const toSaveInput = (
  { pageContent, imageTitles, ...values }: EditProjectValues,
  id?: string,
  savedTitles: EditProjectValues["imageTitles"] = {},
) =>
  ({
    ...values,
    id,
    pageContent: pageContent.map(({ _key, ...block }) => block),
    imageTitles: Object.fromEntries(
      pageContent
        .flatMap((block) => (block.blockType === Slugs.Blocks.IMAGE_GRID ? block.images : []))
        .flatMap((mediaID) =>
          imageTitles[mediaID] === undefined || imageTitles[mediaID] === savedTitles[mediaID]
            ? []
            : [[mediaID, imageTitles[mediaID]]],
        ),
    ),
    // Keys only, as the form holds values like empty content that the schema rejects
  }) satisfies Record<keyof z.input<typeof editProjectSchema>, unknown>
