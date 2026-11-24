import type { FocalPoint } from "@uoacs/ui/utils"

export interface Project {
  id: string
  title: string
  imageURL?: string
  imageFocalPoint?: FocalPoint
  authorName: string
  likes: number
  liked?: boolean | Promise<boolean>
  awardType?: string
  summary?: string
  awardEvent?: string
}

export interface ProjectCardVariantProps {
  project: Project
  className?: string
  /**
   * Whether the signed-in member owns the project, which shows the actions menu on the
   * profile card. Ownership is still checked by the server actions.
   */
  isOwner?: boolean
}
