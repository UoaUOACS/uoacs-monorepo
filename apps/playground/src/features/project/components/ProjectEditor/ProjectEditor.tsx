"use client"

import { useSelector } from "@tanstack/react-form"
import { toast } from "@uoacs/ui/toast"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { type SaveProjectResult, saveProject } from "@/features/project/actions/saveProject"
import {
  type BlockValue,
  type EditProjectValues,
  isEmptyBlock,
  type MediaLookup,
  projectFormOptions,
  setSaveErrors,
  toSaveInput,
} from "@/features/project/editor/projectForm.options"
import { preloadRichTextEditor } from "@/lib/form/fields/RichTextField"
import { submitForm } from "@/lib/form/flush"
import { useAppForm } from "@/lib/form/useAppForm"
import { Slugs } from "@/lib/payload/slugs"
import { Routes } from "@/lib/routes"
import { blockElementID } from "./Blocks/BlockFrame"
import { BlockList } from "./Blocks/BlockList"
import { ProjectEditorToolbar } from "./ProjectEditorToolbar"
import { ProjectHeaderEditor } from "./ProjectHeaderEditor/ProjectHeaderEditor"

const SAVE_ERROR_MESSAGES: Record<Extract<SaveProjectResult, { ok: false }>["error"], string> = {
  invalid: "Fix the highlighted fields",
  unauthenticated: "Sign in again to save",
  unavailable: "We could not check your session. Try again.",
  "not-found": "This project no longer exists",
  server: "Something went wrong. Try again.",
}

export interface ProjectEditorProps {
  /**
   * Omitted when creating a project
   */
  projectID?: string
  initialValues: EditProjectValues
  /**
   * The saved cover image, shown until a new one is picked
   */
  coverImageURL?: string
  /**
   * The saved images of the page's image grids
   */
  media?: MediaLookup
}

const BLOCK_ERROR_PATH = /^pageContent\[(\d+)\]/
const IMAGE_TITLE_ERROR_PATH = /^imageTitles\.(\w+)$/

/**
 * The index of the first block with an error, if any. An image title's error is on its grid.
 */
const firstBlockWithError = (fieldErrors: Record<string, string>, blocks: BlockValue[]) => {
  const indexes = Object.keys(fieldErrors).flatMap((path) => {
    const match = BLOCK_ERROR_PATH.exec(path)
    if (match) return [Number(match[1])]
    const mediaID = IMAGE_TITLE_ERROR_PATH.exec(path)?.[1]
    if (!mediaID) return []
    const index = blocks.findIndex(
      (block) => block.blockType === Slugs.Blocks.IMAGE_GRID && block.images.includes(mediaID),
    )
    return index === -1 ? [] : [index]
  })
  return indexes.length > 0 ? Math.min(...indexes) : undefined
}

export const ProjectEditor = ({
  projectID,
  initialValues,
  coverImageURL,
  media: initialMedia = {},
}: ProjectEditorProps) => {
  const router = useRouter()
  // Set by the first save on create, so a second save before the redirect updates that project
  const savedID = useRef(projectID)
  // The titles as last saved, so a save sends only the titles changed since
  const savedTitles = useRef(initialValues.imageTitles)
  // Only this block mounts an editor
  const [activeKey, setActiveKey] = useState<string | null>(null)
  // In state, as TanStack clears a form-level error on the next change
  const [saveError, setSaveError] = useState<string>()
  const [media, setMedia] = useState(initialMedia)

  const showBlock = (index: number) => {
    const key = form.state.values.pageContent[index]?._key
    if (!key) return
    setActiveKey(key)
    // Instant: a smooth scroll aims at the sizes that idle blocks guess before they render
    requestAnimationFrame(() =>
      document
        .getElementById(blockElementID(key))
        ?.scrollIntoView({ block: "center", behavior: "instant" }),
    )
  }

  const save = async (value: EditProjectValues) => {
    // Indexes of the blocks to save. Empty blocks are skipped, not errors.
    const kept = value.pageContent.flatMap((block, index) => (isEmptyBlock(block) ? [] : [index]))
    const pageContent = kept.map((index) => value.pageContent[index])
    const result = await saveProject(
      toSaveInput({ ...value, pageContent }, savedID.current, savedTitles.current),
    )
    if (!result.ok) {
      // Back to editor indexes, as the server counts only the saved blocks
      const fields = Object.fromEntries(
        Object.entries(result.fieldErrors ?? {}).map(([path, message]) => [
          path.replace(BLOCK_ERROR_PATH, (_, index) => `pageContent[${kept[Number(index)]}]`),
          message,
        ]),
      )
      setSaveError(SAVE_ERROR_MESSAGES[result.error])
      setSaveErrors(form, fields)
      const index = firstBlockWithError(fields, value.pageContent)
      if (index !== undefined) showBlock(index)
      return
    }
    savedID.current = result.id
    savedTitles.current = value.imageTitles
    // Not dirty, so leaving does not warn about unsaved changes. Keeps the default values, as new
    // ones differ from the `defaultValues` option, which makes TanStack reset to that option.
    form.reset(value, { keepDefaultValues: true })
    toast.success({ description: "Saved" })
    router.push(Routes.PROJECTS.ID(result.id))
  }

  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: initialValues,
    // A failed save's errors make the form invalid, which would disable the button
    canSubmitWhenInvalid: true,
    onSubmit: ({ value }) => save(value),
  })

  // Most edits open a text block, so load the editor once the page is idle.
  useEffect(() => {
    if (!("requestIdleCallback" in window)) return preloadRichTextEditor()
    const id = requestIdleCallback(preloadRichTextEditor)
    return () => cancelIdleCallback(id)
  }, [])

  const isDirty = useSelector(form.store, (state) => state.isDirty)
  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        // The last save's errors make the form invalid, so TanStack would skip this save
        setSaveError(undefined)
        setSaveErrors(form)
        void submitForm(form)
      }}
    >
      <form.AppForm>
        <ProjectEditorToolbar error={saveError} form={form} projectID={projectID} />
        <div className="flex flex-col gap-12 md:gap-15">
          <ProjectHeaderEditor coverImageURL={coverImageURL} form={form} />
          <BlockList
            activeKey={activeKey}
            form={form}
            media={media}
            onActiveKeyChange={setActiveKey}
            onUpload={(image) => setMedia((current) => ({ ...current, [image.id]: image }))}
          />
        </div>
      </form.AppForm>
    </form>
  )
}
