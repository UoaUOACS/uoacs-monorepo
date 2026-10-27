import { BaseProjectCard } from "./BaseProjectCard"
import { ProfileProjectCard } from "./ProfileProjectCard"
import type { ProjectCardVariantProps } from "./ProjectCard.types"
import type { ProjectCardVariants } from "./ProjectCard.variants"

export type { Project } from "./ProjectCard.types"

interface ProjectCardProps extends ProjectCardVariants, ProjectCardVariantProps {}

export const ProjectCard = ({ variant, ...props }: ProjectCardProps) =>
  variant === "profile" ? <ProfileProjectCard {...props} /> : <BaseProjectCard {...props} />
