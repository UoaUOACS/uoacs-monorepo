import { UserIcon } from "@heroicons/react/24/outline"
import { Heading, LazyImage, Skeleton } from "@uoacs/ui"
import Link from "next/link"
import type { HTMLAttributes, ReactNode } from "react"
import { UNKNOWN_AUTHOR_NAME } from "@/features/project/project.constants"
import { Routes } from "@/lib/routes"
import type { Project } from "@/payload/payload-types"

const AVATAR_CLASS_NAME = "relative size-12 shrink-0 overflow-hidden rounded-full bg-gray-200"

export interface ProjectHeaderProps {
  /**
   * A project with its author and the author's profile picture populated
   */
  project: Pick<Project, "name" | "summary" | "author">
  /**
   * The like button and the author's edit link
   */
  actions?: ReactNode
}

/**
 * The top of a project page: the author, the project's name and summary, and actions.
 */
export const ProjectHeader = ({ project, actions }: ProjectHeaderProps) => {
  const { name, summary, author } = project
  // An unpopulated author is just an ID, e.g. when the member has since been deleted
  const authorName =
    typeof author === "object" ? `${author.firstName} ${author.lastName}` : UNKNOWN_AUTHOR_NAME
  const profilePicture = typeof author === "object" ? author.profilePicture : undefined
  const profilePictureURL = typeof profilePicture === "object" ? profilePicture?.url : undefined
  const authorHref =
    typeof author === "object" ? Routes.PROFILE.USERNAME(author.username) : undefined

  return (
    <header className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="group/author flex min-w-0 items-center gap-4">
          {/* Duplicates the name link, so hide it from keyboard and screen reader users */}
          <AuthorLink
            aria-hidden="true"
            className={AVATAR_CLASS_NAME}
            href={authorHref}
            tabIndex={-1}
          >
            {profilePictureURL ? (
              <LazyImage
                alt={authorName}
                className="object-cover!"
                containerClassName="h-full w-full"
                fill
                sizes="48px"
                src={profilePictureURL}
              />
            ) : (
              <UserIcon aria-hidden="true" className="size-full p-[20%] text-gray-400" />
            )}
          </AuthorLink>
          <div className="flex min-w-0 flex-col gap-1">
            <Heading className="justify-start text-left font-bold" h={4}>
              {name}
            </Heading>
            <AuthorLink className="truncate text-gray-500 text-sm" href={authorHref}>
              <span className="truncate text-gray-900 text-sm group-has-[a:hover]/author:underline">
                {authorName}
              </span>
            </AuthorLink>
          </div>
        </div>
        {actions}
      </div>
      <p className="text-pretty text-gray-600">{summary}</p>
    </header>
  )
}

/**
 * A link to the author's profile, or a plain element when the author has no profile to link to.
 */
const AuthorLink = ({ href, ...props }: HTMLAttributes<HTMLElement> & { href?: string }) =>
  href ? <Link href={href} {...props} /> : <div {...props} />

/**
 * A loading placeholder with the same layout as {@link ProjectHeader}.
 */
export const ProjectHeaderSkeleton = () => (
  <div aria-hidden="true" className="flex w-full flex-col gap-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className={AVATAR_CLASS_NAME} shape="circle" />
        <div className="flex flex-col gap-1">
          <Skeleton className="heading-4 w-56" shape="text" />
          <Skeleton className="h-5 w-28" shape="text" />
        </div>
      </div>
      <ProjectHeaderActionsSkeleton />
    </div>
    <Skeleton className="h-12 w-full" shape="text" />
  </div>
)

/**
 * A placeholder for {@link ProjectHeaderActions} while the session loads.
 */
export const ProjectHeaderActionsSkeleton = () => <Skeleton className="h-6 w-16" />
