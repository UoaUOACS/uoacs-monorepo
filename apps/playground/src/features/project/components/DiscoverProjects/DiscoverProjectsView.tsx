import { cn } from "@uoacs/ui/utils"
import Form from "next/form"
import { useId } from "react"
import { type DiscoverState, getDiscoverHref } from "@/features/project/helpers/discover"
import { SearchBar } from "@/features/search/components/SearchBar/SearchBar"
import { Routes } from "@/lib/routes"
import { PaginatedProjectGrid } from "../PaginatedProjectGrid/PaginatedProjectGrid"
import type { Project } from "../ProjectCard/ProjectCard"
import { ProjectSortDropdown } from "../ProjectSortDropdown/ProjectSortDropdown"
import { discoverProjectsVariants } from "./DiscoverProjects.variants"

interface DiscoverProjectsViewProps extends DiscoverState {
  projects: Project[]
  /** IDs of the projects the signed-in member has liked, streamed in after the grid */
  likedIDs?: Promise<string[]>
  totalPages: number
  className?: string
}

/**
 * The Discover section's layout: tabs and sort, the current page of projects, and pagination.
 * {@link DiscoverProjects} fetches the data; this component only renders it.
 */
export const DiscoverProjectsView = ({
  tab,
  sort,
  page,
  projects,
  likedIDs,
  totalPages,
  className,
}: DiscoverProjectsViewProps) => {
  const { root, header } = discoverProjectsVariants()
  //const tabLabel = PROJECT_TABS.find((option) => option.value === tab)?.label
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={cn(root(), className)}>
      <div className={header()}>
        <div className="hidden w-[70%] items-center justify-center gap-10 md:flex">
          <Form action={Routes.SEARCH} className="w-full">
            <SearchBar name="q" />
          </Form>
          <ProjectSortDropdown
            getSortHref={(value) => getDiscoverHref({ tab, sort: value })}
            sort={sort}
          />
        </div>
      </div>

      <PaginatedProjectGrid
        getPageHref={(target) => getDiscoverHref({ tab, sort, page: target })}
        likedIDs={likedIDs}
        page={page}
        prefetchNeighbours
        projects={projects}
        totalPages={totalPages}
      />
    </section>
  )
}
