import { IntentPrefetchLink, LazyImage } from "@uoacs/ui"
import AwardIcon from "@/features/project/components/AwardIcon/AwardIcon"
import { LikeButton } from "@/features/project/components/LikeButton/LikeButton"
import { Routes } from "@/lib/routes"
import type { ProjectCardVariantProps } from "./ProjectCard.types"
import { projectCardVariants } from "./ProjectCard.variants"

export const ProfileProjectCard = ({ project, className }: ProjectCardVariantProps) => {
  const { id, title, imageURL, imageFocalPoint, likes, liked, awardType, summary, awardEvent } =
    project
  const {
    base,
    imageWrapper,
    title: titleStyles,
    awardIcon,
    likesGroup,
    heartIcon,
    likesCount,
    content,
    textGroup,
    description,
    awardGroup,
    awardTitle,
    awardSubtitle,
  } = projectCardVariants({ variant: "profile" })

  return (
    <div className={base({ className })}>
      <IntentPrefetchLink className={imageWrapper()} href={Routes.PROJECTS.ID(id)}>
        {imageURL ? (
          <LazyImage
            alt={title}
            className="object-cover!"
            containerClassName="h-full w-full"
            fill
            focalPoint={imageFocalPoint}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 256px, 100vw"
            src={imageURL}
          />
        ) : null}
      </IntentPrefetchLink>

      <div className={content()}>
        <IntentPrefetchLink className="flex flex-1 flex-col gap-4" href={Routes.PROJECTS.ID(id)}>
          {awardType ? (
            <div className={awardGroup()}>
              <AwardIcon className={awardIcon()} />
              <div>
                <p className={awardTitle()}>{awardType}</p>
                {awardEvent ? <p className={awardSubtitle()}>Awarded at {awardEvent}</p> : null}
              </div>
            </div>
          ) : null}
          <div className={textGroup()}>
            <h3 className={titleStyles()}>{title}</h3>
            {summary ? <p className={description()}>{summary}</p> : null}
          </div>
        </IntentPrefetchLink>
        <LikeButton
          className={likesGroup()}
          countClassName={likesCount()}
          iconClassName={heartIcon()}
          isLiked={liked}
          likes={likes}
          projectID={id}
        />
      </div>
    </div>
  )
}
