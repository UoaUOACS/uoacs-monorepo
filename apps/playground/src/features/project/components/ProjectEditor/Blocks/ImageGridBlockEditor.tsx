"use client"

import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { downscaleImage } from "@uoacs/shared"
import { type GalleryImage, Input, LazyImage } from "@uoacs/ui"
import { type Dispatch, type SetStateAction, useId, useRef, useState } from "react"
import { uploadProjectMedia } from "@/features/project/actions/uploadProjectMedia"
import { type MediaLookup, projectFormOptions } from "@/features/project/editor/projectForm.options"
import {
  IMAGE_GRID_MAX_IMAGES,
  IMAGE_TITLE_MAX_LENGTH,
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
  MEDIA_UPLOAD_MAX_DIMENSION,
} from "@/features/project/project.constants"
import { trackUpload } from "@/lib/form/flush"
import { getFieldError } from "@/lib/form/formContext"
import { withForm } from "@/lib/form/useAppForm"

export type PendingImage = { key: string; previewURL: string; error?: string }

const tile = "relative aspect-square overflow-hidden rounded-xl bg-gray-100"
const removeButton =
  "absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"

/**
 * Uploads images as they are picked and shows each one's progress. Save waits for the uploads.
 */
export const ImageGridBlockEditor = withForm({
  ...projectFormOptions,
  props: {
    index: 0,
    /**
     * The block's `_key`, to find the block again when an upload finishes after a move
     */
    blockKey: "",
    media: {} as MediaLookup,
    onUpload: (_image: GalleryImage) => {},
    /**
     * Uploads that are running or failed. Held by the frame, as they outlive this editor.
     */
    pending: [] as PendingImage[],
    setPending: (() => {}) as Dispatch<SetStateAction<PendingImage[]>>,
  },
  render: function Render({ form, index, blockKey, media, onUpload, pending, setPending }) {
    const inputID = useId()
    const [notice, setNotice] = useState<string>()

    const updatePending = (key: string, error?: string) =>
      setPending((images) =>
        images.flatMap((image) => {
          if (image.key !== key) return [image]
          if (error) return [{ ...image, error }]
          URL.revokeObjectURL(image.previewURL)
          return []
        }),
      )

    const upload = async (original: File) => {
      try {
        const file = await downscaleImage(original, {
          maxDimension: MEDIA_UPLOAD_MAX_DIMENSION,
          maxBytes: MEDIA_MAX_BYTES,
        })
        if (file.size > MEDIA_MAX_BYTES) {
          return {
            ok: false as const,
            message: `Choose an image under ${Math.floor(MEDIA_MAX_BYTES / 1024 / 1024)} MB`,
          }
        }
        const formData = new FormData()
        formData.set("file", file)
        return await uploadProjectMedia(formData)
      } catch (error) {
        console.error("[ImageGridBlockEditor] upload failed", { error })
        return { ok: false as const, message: undefined }
      }
    }

    const add = (key: string, result: Awaited<ReturnType<typeof upload>>) => {
      if (!result.ok) {
        updatePending(key, result.message ?? "The image could not be uploaded")
        return
      }
      onUpload({
        id: result.id,
        src: result.url ?? "",
        alt: result.alt,
        width: result.width,
        height: result.height,
      })
      form.setFieldValue(`imageTitles.${result.id}`, result.alt)
      // By key, as the block can move or be deleted while the image uploads
      const at = form.state.values.pageContent.findIndex((block) => block._key === blockKey)
      if (at !== -1) form.pushFieldValue(`pageContent[${at}].images`, result.id)
      updatePending(key)
    }

    // Uploads run at once, but each image joins the grid in the order it was picked
    const queue = useRef(Promise.resolve())

    return (
      <form.Field mode="array" name={`pageContent[${index}].images`}>
        {(field) => {
          const images = field.state.value
          const slots = IMAGE_GRID_MAX_IMAGES - images.length - pending.length
          const error = getFieldError(field.state.meta.errors)

          const addFiles = (files: File[]) => {
            setNotice(
              files.length > slots
                ? `A grid can have ${IMAGE_GRID_MAX_IMAGES} images. The extra images were not added.`
                : undefined,
            )
            for (const file of files.slice(0, Math.max(slots, 0))) {
              const key = crypto.randomUUID()
              const previewURL = URL.createObjectURL(file)
              if (!MEDIA_TYPES.includes(file.type)) {
                setPending((current) => [
                  ...current,
                  { key, previewURL, error: "This file type is not supported" },
                ])
                continue
              }
              setPending((current) => [...current, { key, previewURL }])
              const uploaded = upload(file)
              queue.current = queue.current.then(() => uploaded).then((result) => add(key, result))
              trackUpload(form, queue.current)
            }
            field.handleBlur()
          }

          return (
            <div className="flex w-full flex-col gap-2">
              <ul aria-label="Images" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((id, imageIndex) => {
                  const image = media[id]
                  return (
                    <li className="flex flex-col gap-1" key={id}>
                      <div className={tile}>
                        {image && (
                          <LazyImage
                            alt={image.alt}
                            className="object-cover!"
                            containerClassName="absolute inset-0"
                            fill
                            sizes="(min-width: 640px) 33vw, 50vw"
                            src={image.src}
                          />
                        )}
                        <button
                          className={removeButton}
                          onClick={() => field.removeValue(imageIndex)}
                          type="button"
                        >
                          <XMarkIcon aria-hidden className="size-4" />
                          <span className="sr-only">Remove image {imageIndex + 1}</span>
                        </button>
                      </div>
                      <form.Field
                        name={`imageTitles.${id}`}
                        validators={{
                          onChange: ({ value }) => (value?.trim() ? undefined : "Add a title"),
                        }}
                      >
                        {(title) => (
                          <Input
                            aria-label={`Title of image ${imageIndex + 1}`}
                            className="px-2 py-1 text-sm"
                            error={getFieldError(title.state.meta.errors)}
                            maxLength={IMAGE_TITLE_MAX_LENGTH}
                            onBlur={title.handleBlur}
                            onChange={(event) => title.handleChange(event.target.value)}
                            placeholder="Title"
                            value={title.state.value ?? ""}
                          />
                        )}
                      </form.Field>
                    </li>
                  )
                })}
                {pending.map((image) => (
                  <li aria-busy={!image.error || undefined} className={tile} key={image.key}>
                    {/* biome-ignore lint/performance/noImgElement: an object URL, which next/image cannot load */}
                    <img
                      alt=""
                      className="absolute inset-0 size-full object-cover opacity-50"
                      src={image.previewURL}
                    />
                    <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-sm font-medium text-gray-900">
                      {image.error ?? "Uploading…"}
                    </span>
                    {image.error && (
                      <button
                        className={removeButton}
                        onClick={() => updatePending(image.key)}
                        type="button"
                      >
                        <XMarkIcon aria-hidden className="size-4" />
                        <span className="sr-only">Dismiss</span>
                      </button>
                    )}
                  </li>
                ))}
                {slots > 0 && (
                  <li className={tile}>
                    <label
                      className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-sm font-medium text-gray-500 focus-within:[outline:-webkit-focus-ring-color_auto_1px] hover:bg-gray-200"
                      htmlFor={inputID}
                    >
                      <PhotoIcon aria-hidden className="size-8 stroke-2" />
                      Add images
                      <input
                        accept={MEDIA_TYPES.join(",")}
                        aria-describedby={error ? `${inputID}-error` : undefined}
                        aria-invalid={error ? true : undefined}
                        className="sr-only"
                        id={inputID}
                        multiple
                        onChange={(event) => {
                          addFiles(Array.from(event.target.files ?? []))
                          event.target.value = ""
                        }}
                        type="file"
                      />
                    </label>
                  </li>
                )}
              </ul>
              <p className="text-right text-sm text-gray-500">
                {images.length}/{IMAGE_GRID_MAX_IMAGES} images
              </p>
              {notice && <p className="text-sm text-gray-700">{notice}</p>}
              {error && (
                <p className="text-sm text-red-600" id={`${inputID}-error`}>
                  {error}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>
    )
  },
})
