import { Pagination } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { ProjectGrid, type ProjectGridProps } from "../ProjectGrid/ProjectGrid"
import { paginatedProjectGridVariants } from "./PaginatedProjectGrid.variants"

interface PaginatedProjectGridProps extends ProjectGridProps {
  page: number
  totalPages: number
  /**
   * Builds the link for a page, so the grid can live on any page.
   */
  getPageHref: (page: number) => string
  /**
   * Fully prefetch the previous and next pages. Only enable it when the page data is cached.
   */
  prefetchNeighbours?: boolean
  className?: string
}

/**
 * A page of projects with pagination below it. Shared by the Discover section and search.
 */
export const PaginatedProjectGrid = ({
  projects,
  likedIDs,
  page,
  totalPages,
  getPageHref,
  prefetchNeighbours,
  className,
}: PaginatedProjectGridProps) => {
  const { root, pagination } = paginatedProjectGridVariants()

  return (
    <div className={cn(root(), className)}>
      <ProjectGrid likedIDs={likedIDs} projects={projects} />

      {totalPages > 1 && (
        <Pagination
          aria-label="Projects pagination"
          className={pagination()}
          getHref={getPageHref}
          page={page}
          prefetchNeighbours={prefetchNeighbours}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
