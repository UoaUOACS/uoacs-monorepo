"use client"

import type { GalleryImage } from "@uoacs/ui"
import { Fragment, useRef } from "react"
import {
  createBlock,
  type MediaLookup,
  projectFormOptions,
} from "@/features/project/editor/projectForm.options"
import { PROJECT_MAX_BLOCKS } from "@/features/project/project.constants"
import { getFieldError } from "@/lib/form/formContext"
import { withForm } from "@/lib/form/useAppForm"
import { BlockFrame, blockElementID } from "./BlockFrame"
import { BlockInsertPoint } from "./BlockInsertPoint"

/**
 * The page's blocks, with an insert point before, between and after them
 */
export const BlockList = withForm({
  ...projectFormOptions,
  props: {
    /**
     * The `_key` of the block whose editor is open
     */
    activeKey: null as string | null,
    onActiveKeyChange: (_key: string | null) => {},
    media: {} as MediaLookup,
    onUpload: (_image: GalleryImage) => {},
  },
  render: function Render({ form, activeKey, onActiveKeyChange, media, onUpload }) {
    const section = useRef<HTMLElement>(null)
    return (
      <form.Field mode="array" name="pageContent">
        {(field) => {
          const blocks = field.state.value
          const error = getFieldError(field.state.meta.errors)
          const canInsert = blocks.length < PROJECT_MAX_BLOCKS
          const insertPoint = (index: number) =>
            canInsert && (
              <BlockInsertPoint
                between={index < blocks.length}
                onInsert={(blockType) => {
                  const block = createBlock(blockType)
                  field.insertValue(index, block)
                  onActiveKeyChange(block._key)
                }}
              />
            )

          return (
            <section
              aria-label="Page content"
              className="flex min-h-80 flex-col items-center gap-2 rounded-md border border-gray-200 px-4 py-8 md:px-12"
              ref={section}
            >
              {insertPoint(0)}
              {blocks.map((block, index) => (
                <Fragment key={block._key}>
                  <BlockFrame
                    active={block._key === activeKey}
                    form={form}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    media={media}
                    onActivate={() => onActiveKeyChange(block._key)}
                    onDeactivate={() => onActiveKeyChange(null)}
                    onDelete={() => {
                      const next = blocks[index + 1]
                      field.removeValue(index)
                      if (block._key === activeKey) onActiveKeyChange(null)
                      // The focused Remove option unmounts with the frame, so focus the next block,
                      // or the insert point at the end once it renders
                      requestAnimationFrame(() => {
                        const frame = next && document.getElementById(blockElementID(next._key))
                        const target = frame
                          ? frame.querySelector("button")
                          : Array.from(section.current?.querySelectorAll("button") ?? []).at(-1)
                        target?.focus()
                      })
                    }}
                    onMove={(to) => field.moveValue(index, to)}
                    onUpload={onUpload}
                  />
                  {insertPoint(index + 1)}
                </Fragment>
              ))}
              {!canInsert && (
                <p className="text-sm text-gray-500">
                  A page can have {PROJECT_MAX_BLOCKS} sections. Delete one to add another.
                </p>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </section>
          )
        }}
      </form.Field>
    )
  },
})
