import { Skeleton } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { type ProjectCardVariants, projectCardVariants } from "./ProjectCard.variants"

/**
 * A loading placeholder with the same shape as a {@link ProjectCard}. It reuses the card's own
 * layout classes so its footer is the same height as a real card's.
 */
export const ProjectCardSkeleton = ({ variant }: ProjectCardVariants) => {
  const { base, imageWrapper, content, textGroup, footer, authorGroup, authorName, likesGroup } =
    projectCardVariants({ variant })

  if (variant === "profile") {
    return (
      <div className={base()}>
        <Skeleton className={cn(imageWrapper(), "h-auto rounded-2xl")} />
        <div className={content()}>
          <div className={cn(textGroup(), "space-y-2")}>
            <Skeleton className="w-48 text-3xl" shape="text" />
            <Skeleton className="w-full max-w-md text-xl" shape="text" />
          </div>
          <Skeleton className="w-12" shape="text" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-sm flex-col">
      <Skeleton className="aspect-4/3 h-auto rounded-2xl" />
      <div className={footer()}>
        <div className={authorGroup()}>
          <Skeleton className="size-4.5 shrink-0 rounded-sm" />
          <div className={authorName()}>
            <Skeleton className="inline-block w-28 align-middle" shape="text" />
          </div>
        </div>
        <div className={likesGroup()}>
          <Skeleton className="w-10 text-xs" shape="text" />
        </div>
      </div>
    </div>
  )
}
