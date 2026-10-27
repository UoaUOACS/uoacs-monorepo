"use client"

import { type ReactNode, useState } from "react"
import { cn } from "../../utils"
import { LightboxDialog, type LightboxImage } from "./LightboxDialog"

export type { LightboxImage }

/**
 * Props for the {@link ImageLightbox} component.
 */
export interface ImageLightboxProps {
  /**
   * Every image the user can step through. Previous and next buttons show when there are 2 or more.
   */
  images: LightboxImage[]
  /**
   * The image that opens first
   */
  index?: number
  /**
   * What the user clicks to open the full image, usually a thumbnail
   */
  children: ReactNode
  /**
   * Additional class names for the button around `children`
   */
  className?: string
}

/**
 * Shows full, uncropped images in a {@link LightboxDialog} when the user clicks `children`.
 *
 * @example
 * <ImageLightbox images={images} index={2}>
 *   <LazyImage src={images[2].src} alt="" fill className="object-cover!" />
 * </ImageLightbox>
 */
export const ImageLightbox = ({ images, index = 0, children, className }: ImageLightboxProps) => {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(index)

  return (
    <>
      <button
        aria-label={`View ${images[index]?.alt ?? "image"}`}
        className={cn("block size-full cursor-zoom-in", className)}
        onClick={() => {
          setCurrent(index)
          setOpen(true)
        }}
        type="button"
      >
        {children}
      </button>
      <LightboxDialog
        images={images}
        index={current}
        onClose={() => setOpen(false)}
        onIndexChange={setCurrent}
        open={open}
      />
    </>
  )
}
