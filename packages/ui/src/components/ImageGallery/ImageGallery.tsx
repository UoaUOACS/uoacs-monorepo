"use client"

import { useState } from "react"
import { cn, type GalleryImage, getAspectRatio } from "../../utils"
import { LightboxDialog } from "../ImageLightbox/LightboxDialog"
import { LazyImage } from "../LazyImage/LazyImage"

export type { GalleryImage }

/**
 * Props for the {@link ImageGallery} component.
 */
export interface ImageGalleryProps {
  images: GalleryImage[]
  /**
   * The gallery's widest rendered width, in px, for each image's `sizes`. Does not cap the width.
   */
  maxWidth?: number
  className?: string
}

/**
 * Most columns in the span grid, from the `md` breakpoint up
 */
const MAX_COLUMNS = 4

/**
 * Columns an image spans, so each cell is close to its shape: 1 up to 1.2:1, 2 up to 2.4:1, else 4
 */
const getSpan = (ratio: number) => (ratio >= 2.4 ? 4 : ratio >= 1.2 ? 2 : 1)

/**
 * Empty cells left when the grid places images in order, moving to a new row when one does not
 * fit, as the default `grid-auto-flow: row` does
 */
const countEmptyCells = (spans: number[], columns: number) => {
  let empty = 0
  let column = 0
  for (const span of spans) {
    const width = Math.min(span, columns)
    if (column + width > columns) {
      empty += columns - column
      column = 0
    }
    column += width
  }
  return column === 0 ? empty : empty + columns - column
}

/**
 * 3 or 4 columns, whichever leaves fewer empty cells. 2 would make every image too big.
 */
const getColumns = (spans: number[]) => {
  let best = MAX_COLUMNS
  for (let columns = MAX_COLUMNS - 1; columns >= 3; columns--) {
    if (countEmptyCells(spans, columns) < countEmptyCells(spans, best)) best = columns
  }
  return best
}

// Phones always have 2 columns
const SPAN_CLASS_NAMES: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2 md:col-span-3",
  4: "col-span-2 md:col-span-4",
}

const COLUMN_CLASS_NAMES: Record<number, string> = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
}

const TILE_CLASS_NAME = "overflow-hidden rounded-xl bg-gray-100"

interface TileProps {
  image: GalleryImage
  sizes: string
  cover?: boolean
  onOpen: () => void
}

const Tile = ({ image, sizes, cover, onOpen }: TileProps) => (
  <button
    aria-label={`View ${image.alt}`}
    className="block size-full cursor-zoom-in"
    onClick={onOpen}
    type="button"
  >
    <LazyImage
      alt=""
      className={cover ? "object-cover!" : undefined}
      containerClassName="size-full"
      fill
      focalPoint={image}
      sizes={sizes}
      src={image.src}
    />
  </button>
)

interface GalleryLayoutProps extends ImageGalleryProps {
  maxWidth: number
  onOpen: (index: number) => void
}

const GalleryLayout = ({ images, maxWidth, className, onOpen }: GalleryLayoutProps) => {
  const [first] = images
  if (!first) return null

  if (images.length === 1) {
    const ratio = getAspectRatio(first)
    return (
      <div
        className={cn("mx-auto w-full", TILE_CLASS_NAME, className)}
        // Caps the height at 70vh by narrowing the box, so the image keeps its shape
        style={{ aspectRatio: ratio, maxWidth: `calc(70vh * ${ratio})` }}
      >
        <Tile
          image={first}
          onOpen={() => onOpen(0)}
          sizes={`(min-width: ${maxWidth}px) ${maxWidth}px, 100vw`}
        />
      </div>
    )
  }

  if (images.every((image) => getAspectRatio(image) < 1)) {
    return (
      <div className={cn("grid w-full grid-cols-2 gap-2 md:grid-cols-3", className)}>
        {images.map((image, index) => (
          <div className={cn("aspect-2/3", TILE_CLASS_NAME)} key={image.id}>
            <Tile
              cover
              image={image}
              onOpen={() => onOpen(index)}
              sizes={`(min-width: ${maxWidth}px) ${Math.round(maxWidth / 3)}px, 50vw`}
            />
          </div>
        ))}
      </div>
    )
  }

  const spans = images.map((image) => getSpan(getAspectRatio(image)))
  const columns = getColumns(spans)

  return (
    // Row heights use `cqw`, which measures the nearest container above the grid
    <div className={cn("@container w-full", className)}>
      <div
        className={cn(
          "grid grid-cols-2 gap-2",
          // A row is 1.25 column widths tall: 1-column cells are 4:5, 2-column cells about 8:5
          "auto-rows-[calc((100cqw-var(--spacing)*2)/2*1.25)]",
          columns === 3 && "md:auto-rows-[calc((100cqw-var(--spacing)*4)/3*1.25)]",
          columns === 4 && "md:auto-rows-[calc((100cqw-var(--spacing)*6)/4*1.25)]",
          COLUMN_CLASS_NAMES[columns],
        )}
      >
        {images.map((image, index) => {
          const span = Math.min(spans[index] ?? 1, columns)
          return (
            <div className={cn(SPAN_CLASS_NAMES[span], TILE_CLASS_NAME)} key={image.id}>
              <Tile
                cover
                image={image}
                onOpen={() => onOpen(index)}
                sizes={`(min-width: ${maxWidth}px) ${Math.round((maxWidth * span) / columns)}px, ${span > 1 ? 100 : 50}vw`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Shows images of any shape with little cropping. Each image opens uncropped in one
 * {@link LightboxDialog}, which steps through the whole gallery.
 */
export const ImageGallery = ({ maxWidth = 768, ...props }: ImageGalleryProps) => {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  if (props.images.length === 0) return null

  return (
    <>
      <GalleryLayout
        {...props}
        maxWidth={maxWidth}
        onOpen={(index) => {
          setCurrent(index)
          setOpen(true)
        }}
      />
      <LightboxDialog
        images={props.images}
        index={current}
        onClose={() => setOpen(false)}
        onIndexChange={setCurrent}
        open={open}
      />
    </>
  )
}
