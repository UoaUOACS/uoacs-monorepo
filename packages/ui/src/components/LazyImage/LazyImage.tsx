"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { cn, type FocalPoint, toObjectPosition } from "../../utils"
import { Skeleton } from "../Skeleton/Skeleton"

/**
 * A component that displays an image with a loading placeholder.
 */
interface LazyImageProps extends ImageProps {
  /**
   * The class name for the container div
   */
  containerClassName?: string
  /**
   * The class name for the skeleton placeholder
   */
  skeletonClassName?: string
  /**
   * Keeps this point in view when the image is cropped, e.g. with `object-cover`
   */
  focalPoint?: FocalPoint
}

/**
 * A component that displays an image with a loading placeholder.
 *
 * @param width The width of the image
 * @param height The height of the image
 * @param className The class name for the image
 * @param containerClassName The class name for the container div
 * @param skeletonClassName The class name for the skeleton placeholder
 * @param focalPoint The point to keep in view when the image is cropped
 * @param props Other {@link ImageProps}
 */
export function LazyImage({
  width,
  height,
  className,
  containerClassName,
  skeletonClassName,
  focalPoint,
  style,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn("relative", containerClassName)} style={{ width, height }}>
      {!isLoaded && <Skeleton className={cn("absolute inset-0 h-auto", skeletonClassName)} />}
      <Image
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        height={height}
        onError={() => {
          setIsLoaded(true)
        }}
        onLoad={() => {
          setIsLoaded(true)
        }}
        style={focalPoint ? { objectPosition: toObjectPosition(focalPoint), ...style } : style}
        width={width}
        {...props}
      />
    </div>
  )
}
