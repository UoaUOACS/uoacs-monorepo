"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { useEffect } from "react"
import { cn } from "../../utils"
import { Dialog } from "../Dialog/Dialog"

export interface LightboxImage {
  src: string
  /**
   * Also the dialog title
   */
  alt: string
  /**
   * The full image's width. Gives the dialog the right shape before the image loads.
   */
  width?: number | null
  height?: number | null
}

const NAV_BUTTON_CLASS_NAME =
  "-translate-y-1/2 absolute top-1/2 cursor-pointer rounded-full bg-white/80 p-2 text-gray-900 shadow transition-colors hover:bg-white"

/**
 * Props for the {@link LightboxDialog} component.
 */
export interface LightboxDialogProps {
  /**
   * Every image the user can step through. Previous and next buttons show when there are 2 or more.
   */
  images: LightboxImage[]
  /**
   * The image to show
   */
  index: number
  open: boolean
  onIndexChange: (index: number) => void
  onClose: () => void
}

/**
 * A controlled dialog that shows full, uncropped images. The arrow buttons and arrow keys step
 * through `images`, looping at each end.
 */
export const LightboxDialog = ({
  images,
  index,
  open,
  onIndexChange,
  onClose,
}: LightboxDialogProps) => {
  const image = images[index]
  const hasNav = images.length > 1

  const step = (by: number) => onIndexChange((index + by + images.length) % images.length)

  useEffect(() => {
    if (!open || !hasNav) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1)
      if (event.key === "ArrowRight") step(1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  return (
    <Dialog className="max-w-5xl" onClose={onClose} open={open && !!image} title={image?.alt}>
      {image && (
        <div className="relative">
          <Image
            alt={image.alt}
            className="mx-auto max-h-[80dvh] w-auto object-contain"
            height={image.height ?? 1200}
            key={image.src}
            sizes="100vw"
            src={image.src}
            width={image.width ?? 1600}
          />
          {hasNav && (
            <>
              <button
                aria-label="Previous image"
                className={cn(NAV_BUTTON_CLASS_NAME, "left-2")}
                onClick={() => step(-1)}
                type="button"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <button
                aria-label="Next image"
                className={cn(NAV_BUTTON_CLASS_NAME, "right-2")}
                onClick={() => step(1)}
                type="button"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
      {image && hasNav && (
        <p aria-live="polite" className="text-center text-sm text-gray-500">
          {index + 1} / {images.length}
        </p>
      )}
    </Dialog>
  )
}
