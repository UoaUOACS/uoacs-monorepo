import { getCurrentMember } from "@/features/member/member.queries"
import { BaseProjectCard } from "./BaseProjectCard"
import { ProfileProjectCard } from "./ProfileProjectCard"
import type { Project } from "./ProjectCard.types"
import type { ProjectCardVariants } from "./ProjectCard.variants"

export type { Project } from "./ProjectCard.types"

interface ProjectCardProps extends ProjectCardVariants {
  project: Project
  className?: string
}

// The session only decides the owner's menu, so hide it on failure
const isCurrentMemberAuthor = (authorID: string | undefined) =>
  getCurrentMember()
    .then((current) => current.status === "authenticated" && current.member.id === authorID)
    .catch((error) => {
      console.error("[ProjectCard] Failed to load the session's member", { error })
      return false
    })

export const ProjectCard = ({ variant, ...props }: ProjectCardProps) => {
  // Not awaited, so the card renders under cached fetches and the menu streams in.
  const isOwner = isCurrentMemberAuthor(props.project.authorID)

  return variant === "profile" ? (
    <ProfileProjectCard {...props} isOwner={isOwner} />
  ) : (
    <BaseProjectCard {...props} isOwner={isOwner} />
  )
}
