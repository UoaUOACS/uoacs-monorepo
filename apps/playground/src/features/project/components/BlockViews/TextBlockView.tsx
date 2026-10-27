import type { RichTextValue } from "@uoacs/shared/payload"
import { RichTextContent } from "@/features/project/components/RichTextContent/RichTextContent"
import { getFirstLineOfText } from "@/features/project/helpers/richText"
import { compactBlockVariants } from "./BlockViews.variants"

export interface TextBlockViewProps {
  content: RichTextValue | null
  /**
   * Show one fixed-height row with the first line of text, for reorder mode
   */
  compact?: boolean
}

export const TextBlockView = ({ content, compact }: TextBlockViewProps) => {
  if (!compact) return <RichTextContent className="w-full" data={content} />

  const { base, content: contentStyles } = compactBlockVariants()
  return (
    <div className={base()}>
      <span className={contentStyles()}>{getFirstLineOfText(content) || "Empty"}</span>
    </div>
  )
}
