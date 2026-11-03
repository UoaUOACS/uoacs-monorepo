import { PlusIcon } from "@heroicons/react/24/outline"
import { EmptyState } from "@uoacs/ui"
import Link from "next/link"
import { type Project, ProjectCard } from "@/features/project/components/ProjectCard/ProjectCard"
import { ProjectCardSkeleton } from "@/features/project/components/ProjectCard/ProjectCardSkeleton"
import { Routes } from "@/lib/routes"

const LIST_CLASS_NAME = "flex flex-col gap-6"

export interface ProfileProjectsViewProps {
  /**
   * The member's projects, newest first.
   */
  projects: Project[]
  /**
   * IDs of the projects the signed-in member has liked.
   */
  likedIDs?: string[]
  /**
   * Whether the signed-in member owns this profile, which shows them the new project link.
   */
  isOwner: boolean
}

const NewProjectLink = () => (
  <Link
    className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 py-8 font-medium text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-900"
    href={Routes.PROJECTS.CREATE}
  >
    <PlusIcon aria-hidden="true" className="size-6" />
    New project
  </Link>
)

/**
 * The profile's "Projects" tab: the member's projects as wide cards, and a link to create one for
 * the profile's owner. {@link ProfileProjects} fetches the data.
 */
export const ProfileProjectsView = ({
  projects,
  likedIDs = [],
  isOwner,
}: ProfileProjectsViewProps) => {
  const liked = new Set(likedIDs)

  return (
    <div className={LIST_CLASS_NAME}>
      {projects.length === 0 ? (
        <EmptyState
          description={
            isOwner
              ? "Projects you create will show up here."
              : "This member hasn't shared any projects yet."
          }
          title="No projects yet"
        />
      ) : (
        <ul className={LIST_CLASS_NAME}>
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={{ ...project, liked: liked.has(project.id) }}
                variant="profile"
              />
            </li>
          ))}
        </ul>
      )}
      {isOwner && <NewProjectLink />}
    </div>
  )
}

/**
 * A loading placeholder with the same layout as {@link ProfileProjectsView}.
 */
export const ProfileProjectsSkeleton = () => (
  <div aria-busy="true" aria-label="Loading projects" className={LIST_CLASS_NAME} role="status">
    <ProjectCardSkeleton variant="profile" />
    <ProjectCardSkeleton variant="profile" />
  </div>
)
