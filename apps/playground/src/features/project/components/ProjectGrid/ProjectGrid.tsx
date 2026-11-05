import { EmptyState } from "@uoacs/ui"
import { type Project, ProjectCard } from "../ProjectCard/ProjectCard"

export interface ProjectGridProps {
  projects: Project[]
  /** IDs of the projects the signed-in member has liked, streamed in after the grid */
  likedIDs?: Promise<string[]>
}

/**
 * The grid layout, shared with {@link ProjectGridSkeleton} so loading and loaded states line up.
 */
export const projectGridClassName =
  "grid grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"

export const ProjectGrid = ({ projects, likedIDs }: ProjectGridProps) => {
  const liked = likedIDs?.then((ids) => new Set(ids))

  if (projects.length === 0) {
    return (
      <EmptyState
        description="Projects will show up here once they've been added to this tab."
        title="No projects yet"
      />
    )
  }

  return (
    <div className={projectGridClassName}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={{ ...project, liked: liked?.then((ids) => ids.has(project.id)) }}
        />
      ))}
    </div>
  )
}
