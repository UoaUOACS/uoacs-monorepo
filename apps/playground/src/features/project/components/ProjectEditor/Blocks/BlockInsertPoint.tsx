"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { Dropdown } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import type { BlockValue } from "@/features/project/editor/projectForm.options"
import { preloadRichTextEditor } from "@/lib/form/fields/RichTextField"
import { Slugs } from "@/lib/payload/slugs"

const revealClassName =
  "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"

export interface BlockInsertPointProps {
  onInsert: (blockType: BlockValue["blockType"]) => void
  /**
   * Whether the point sits between blocks, so it shows only on hover, focus or touch screens
   */
  between?: boolean
}

/**
 * A "+" button that opens a menu of block types to insert at this point
 */
export const BlockInsertPoint = ({ onInsert, between = false }: BlockInsertPointProps) => (
  // The user may pick Text, so start loading the editor early
  // biome-ignore lint/a11y/noStaticElementInteractions: preloads code on hover or focus of the menu inside, and handles no input
  <div
    className={cn("flex justify-center", between && "group relative h-12 w-full items-center")}
    onFocus={preloadRichTextEditor}
    onPointerEnter={preloadRichTextEditor}
  >
    {between && (
      <div aria-hidden className={cn("absolute inset-x-0 h-px bg-gray-300", revealClassName)} />
    )}
    {/* The ring follows the BorderButton border slot */}
    <div className={cn(!between && "group rounded-full border-4 border-gray-200 bg-white")}>
      <Dropdown
        fast
        label={
          between ? (
            <span
              className={cn(
                "rounded-full border border-gray-300 bg-white p-0.5 text-gray-500 pointer-coarse:opacity-100",
                revealClassName,
              )}
            >
              <PlusIcon aria-hidden className="size-4" />
              <span className="sr-only">Add a section</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-600 transition-colors group-hover:text-black">
              <PlusIcon aria-hidden className="size-4" />
              Add a section
            </span>
          )
        }
        options={[
          {
            label: "Text",
            onClick: () => onInsert(Slugs.Blocks.TEXT),
            theme: "ghost",
            className: "w-full justify-start",
          },
          {
            label: "Image grid",
            onClick: () => onInsert(Slugs.Blocks.IMAGE_GRID),
            theme: "ghost",
            className: "w-full justify-start",
          },
        ]}
        popoverClassName="right-auto left-1/2 -translate-x-1/2 items-stretch gap-0 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
        shape="pill"
        size={between ? "icon" : "sm"}
        theme="ghost"
        trigger={false}
      />
    </div>
  </div>
)
