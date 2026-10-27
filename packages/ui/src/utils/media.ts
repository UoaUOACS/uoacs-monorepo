/**
 * Focal point as Payload stores it on an upload doc
 */
export interface FocalPoint {
  /**
   * 0–100, from the left edge
   */
  focalX?: number | null
  /**
   * 0–100, from the top edge
   */
  focalY?: number | null
}

/**
 * Size and focal point as Payload stores them on an upload doc
 */
export interface MediaShape extends FocalPoint {
  width?: number | null
  height?: number | null
}

export interface GalleryImage extends MediaShape {
  id: string
  src: string
  alt: string
}

/**
 * Width divided by height, or 1 when the size is unknown
 */
export const getAspectRatio = ({ width, height }: MediaShape) =>
  width && height ? width / height : 1

/**
 * A CSS `object-position` that keeps the focal point in view when the image is cropped
 */
export const toObjectPosition = ({ focalX, focalY }: FocalPoint) =>
  `${focalX ?? 50}% ${focalY ?? 50}%`

/**
 * A populated upload doc, as any collection with `alt` stores it
 */
interface UploadDoc extends MediaShape {
  id: string
  url?: string | null
  alt: string
}

/**
 * Maps an upload field's value to the images that `ImageGallery` shows. Skips images
 * that were deleted or not populated.
 */
export const toGalleryImages = (docs: (string | UploadDoc)[]): GalleryImage[] =>
  docs.flatMap((doc) =>
    typeof doc === "object" && doc.url
      ? [
          {
            id: doc.id,
            src: doc.url,
            alt: doc.alt,
            width: doc.width,
            height: doc.height,
            focalX: doc.focalX,
            focalY: doc.focalY,
          },
        ]
      : [],
  )
