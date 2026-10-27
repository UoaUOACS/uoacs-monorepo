import { toGalleryImages } from "@uoacs/ui/utils"
import { Slugs } from "@/lib/payload"
import type { Project } from "@/payload/payload-types"
import { ImageGridBlockView } from "./ImageGridBlockView"
import { TextBlockView } from "./TextBlockView"

interface BlockViewProps {
  /**
   * A saved block with its images populated
   */
  block: Project["pageContent"][number]
  compact?: boolean
}

export const BlockView = ({ block, compact }: BlockViewProps) => {
  switch (block.blockType) {
    case Slugs.Blocks.TEXT:
      return <TextBlockView compact={compact} content={block.content} />
    case Slugs.Blocks.IMAGE_GRID:
      return <ImageGridBlockView compact={compact} images={toGalleryImages(block.images)} />
  }
}
