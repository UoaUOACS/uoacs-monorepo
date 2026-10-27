"use client"

import { CheckIcon, EllipsisVerticalIcon } from "@heroicons/react/20/solid"
import { useSelector } from "@tanstack/react-form"
import { Button, Dropdown, type DropdownProps, type GalleryImage } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { Suspense, useEffect, useEffectEvent, useRef, useState, useTransition } from "react"
import { ImageGridBlockView } from "@/features/project/components/BlockViews/ImageGridBlockView"
import { TextBlockView } from "@/features/project/components/BlockViews/TextBlockView"
import {
  isEmptyBlock,
  type MediaLookup,
  projectFormOptions,
} from "@/features/project/editor/projectForm.options"
import { preloadRichTextEditor } from "@/lib/form/fields/RichTextField"
import { getFieldError } from "@/lib/form/formContext"
import { withForm } from "@/lib/form/useAppForm"
import { Slugs } from "@/lib/payload/slugs"
import { ImageGridBlockEditor, type PendingImage } from "./ImageGridBlockEditor"
import { TextBlockEditor } from "./TextBlockEditor"

/**
 * The DOM ID of a block's frame, to scroll to it
 */
export const blockElementID = (key: string) => `block-${key}`

const menuOption = (
  label: string,
  onClick: () => void,
  className?: string,
): DropdownProps["options"][number] => ({
  label,
  onClick,
  theme: "ghost",
  className: cn("w-full justify-start", className),
})

/**
 * One block in the editor. Idle blocks show the block view, so only the active block mounts an
 * editor.
 */
export const BlockFrame = withForm({
  ...projectFormOptions,
  props: {
    index: 0,
    isFirst: false,
    isLast: false,
    active: false,
    media: {} as MediaLookup,
    onActivate: () => {},
    onDeactivate: () => {},
    onMove: (_to: number) => {},
    onDelete: () => {},
    onUpload: (_image: GalleryImage) => {},
  },
  render: function Render({
    form,
    index,
    isFirst,
    isLast,
    active,
    media,
    onActivate,
    onDeactivate,
    onMove,
    onDelete,
    onUpload,
  }) {
    // The list only re-renders when blocks are added, moved or removed
    const block = useSelector(form.store, (state) => state.values.pageContent[index])
    const imageTitles = useSelector(form.store, (state) => state.values.imageTitles)
    // Server errors are set for blocks that have no mounted field, so read them from the form
    const error = useSelector(form.store, (state) => {
      const prefix = `pageContent[${index}]`
      for (const [name, meta] of Object.entries(state.fieldMeta)) {
        if (!name.startsWith(prefix) || ![undefined, "."].includes(name[prefix.length])) continue
        const message = getFieldError(meta?.errors ?? [])
        if (message) return message
      }
      // An image title's error belongs to its grid
      const current = state.values.pageContent[index]
      if (current?.blockType !== Slugs.Blocks.IMAGE_GRID) return undefined
      for (const mediaID of current.images) {
        const message = getFieldError(state.fieldMeta[`imageTitles.${mediaID}`]?.errors ?? [])
        if (message) return message
      }
      return undefined
    })
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
    const failedUploads = pendingImages.filter((image) => image.error).length
    // Reads the latest list, so a deleted block releases the previews it still holds
    const releasePreviews = useEffectEvent(() => {
      for (const image of pendingImages) URL.revokeObjectURL(image.previewURL)
    })
    useEffect(() => () => releasePreviews(), [])
    const editButton = useRef<HTMLButtonElement>(null)
    const returnFocus = useRef(false)
    // A transition keeps the view on screen while the editor code loads via the suspense
    const [isActivating, startActivating] = useTransition()
    const activate = () => startActivating(onActivate)

    const close = () => {
      returnFocus.current = true
      // Blur first, so a text field flushes its debounced value before it unmounts
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      onDeactivate()
    }

    const closeOnEscape = useEffectEvent((event: KeyboardEvent) => {
      // An open menu or dialog closes first
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (event.target instanceof Element && event.target.closest("dialog")) return
      close()
    })

    // On the window, as focus can leave the block, e.g. when a removed image's button unmounts
    useEffect(() => {
      if (!active) return
      window.addEventListener("keydown", closeOnEscape)
      return () => window.removeEventListener("keydown", closeOnEscape)
    }, [active])

    // Back to the block once its view shows, so keyboard users keep their place
    useEffect(() => {
      if (active || !returnFocus.current) return
      returnFocus.current = false
      editButton.current?.focus()
    }, [active])

    if (!block) return null

    const isText = block.blockType === Slugs.Blocks.TEXT
    const label = `${isText ? "Text" : "Image grid"} section ${index + 1}`

    const options = [
      ...(active ? [] : [menuOption("Edit", activate)]),
      ...(isFirst ? [] : [menuOption("Move up", () => onMove(index - 1))]),
      ...(isLast ? [] : [menuOption("Move down", () => onMove(index + 1))]),
      menuOption("Remove", onDelete, "text-red-600"),
    ]

    return (
      <div
        className="group/block flex w-full flex-col gap-2 md:flex-row md:items-start"
        id={blockElementID(block._key)}
      >
        <div className="flex min-w-0 grow flex-col gap-2">
          <div
            className={cn(
              "relative rounded-xl p-2",
              error && "outline-2 outline-red-600 outline-offset-4",
              // Skips layout and paint for idle blocks off screen, for long pages
              !active && "[contain-intrinsic-block-size:auto_24rem] [content-visibility:auto]",
            )}
          >
            {/* Mounted before the editor, so the transition can hold the view in its place */}
            <Suspense>
              {active ? (
                isText ? (
                  <TextBlockEditor form={form} index={index} />
                ) : (
                  <ImageGridBlockEditor
                    blockKey={block._key}
                    form={form}
                    index={index}
                    media={media}
                    onUpload={onUpload}
                    pending={pendingImages}
                    setPending={setPendingImages}
                  />
                )
              ) : (
                <>
                  {isEmptyBlock(block) ? (
                    <p className="flex min-h-24 items-center justify-center rounded-xl border border-gray-300 border-dashed text-gray-500 text-sm">
                      {isText ? "Click to write" : "Click to add images"}
                    </p>
                  ) : isText ? (
                    <TextBlockView content={block.content} />
                  ) : (
                    <ImageGridBlockView
                      images={block.images.flatMap((id) =>
                        media[id] ? [{ ...media[id], alt: imageTitles[id] ?? media[id].alt }] : [],
                      )}
                    />
                  )}
                  {/* Covers the view, so a click anywhere or Enter opens the editor */}
                  <button
                    aria-label={`Edit ${label}`}
                    className={cn(
                      "absolute inset-0 cursor-text rounded-xl hover:bg-black/3",
                      isActivating && "bg-black/3",
                    )}
                    onClick={activate}
                    onFocus={isText ? preloadRichTextEditor : undefined}
                    onPointerEnter={isText ? preloadRichTextEditor : undefined}
                    ref={editButton}
                    type="button"
                  />
                </>
              )}
            </Suspense>
          </div>
          {error && !active && <p className="text-red-600 text-sm">{error}</p>}
          {failedUploads > 0 && !active && (
            <p className="text-red-600 text-sm">
              {failedUploads === 1 ? "1 image" : `${failedUploads} images`} could not be uploaded.
              Open the section to see why.
            </p>
          )}
        </div>
        {/* A row above the block on mobile, so the content gets the full width */}
        <div className="flex justify-end gap-2 max-md:order-first md:flex-col">
          <Dropdown
            fast
            label={<span className="sr-only">{label} actions</span>}
            options={options}
            popoverClassName="items-stretch gap-0 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
            shape="pill"
            size="icon"
            theme="ghost"
            trigger={{
              // Shows on hover or focus of the block, and always on touch screens and the open block
              triggerClassName: cn(
                "size-8 bg-gray-100 text-gray-700 md:size-10 opacity-0 transition-opacity",
                "group-focus-within/block:opacity-100 group-hover/block:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100",
                active && "opacity-100",
              ),
              triggerIcon: <EllipsisVerticalIcon aria-hidden className="size-4 md:size-6" />,
            }}
          />
          {active && (
            <Button
              className="size-8 bg-gray-100 text-gray-700 max-md:order-first md:size-10"
              onClick={close}
              shape="pill"
              size="icon"
              theme="ghost"
            >
              <CheckIcon aria-hidden className="size-4 md:size-6" />
              <span className="sr-only">Done editing {label}</span>
            </Button>
          )}
        </div>
      </div>
    )
  },
})
