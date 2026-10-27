import type { FocalPoint } from "@uoacs/ui/utils"

export interface Project {
  id: string
  title: string
  imageURL?: string
  imageFocalPoint?: FocalPoint
  authorName: string
  likes: number
  liked?: boolean
  awardType?: string
  summary?: string
  awardEvent?: string
}

export interface ProjectCardVariantProps {
  project: Project
  className?: string
}
