import { type GalleryImage, ImageGallery, LazyImage } from "@uoacs/ui"
import { compactBlockVariants } from "./BlockViews.variants"

export interface ImageGridBlockViewProps {
  images: GalleryImage[]
  /**
   * Show one fixed-height row with the first few thumbnails, for reorder mode
   */
  compact?: boolean
}

const COMPACT_THUMBNAILS = 3

export const ImageGridBlockView = ({ images, compact }: ImageGridBlockViewProps) => {
  if (!compact) {
    return (
      // A wrapper, as the single-image layout sets its own inline max-width
      <div className="mx-auto w-full max-w-5xl">
        <ImageGallery images={images} maxWidth={1024} />
      </div>
    )
  }

  const { base, content, thumbnail } = compactBlockVariants()
  const hidden = images.length - COMPACT_THUMBNAILS
  return (
    <div className={base()}>
      <div className={content()}>
        {images.slice(0, COMPACT_THUMBNAILS).map((image) => (
          <LazyImage
            alt={image.alt}
            className="object-cover!"
            containerClassName={thumbnail()}
            fill
            key={image.id}
            sizes="40px"
            src={image.src}
          />
        ))}
        {hidden > 0 && <span className="text-gray-500">+{hidden}</span>}
      </div>
    </div>
  )
}
