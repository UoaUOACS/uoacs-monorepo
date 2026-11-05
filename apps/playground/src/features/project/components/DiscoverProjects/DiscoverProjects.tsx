import { AnimatedSuspense } from "@uoacs/ui"
import { redirect } from "next/navigation"
import type { SearchParams } from "nuqs/server"
import { getCurrentMember } from "@/features/member/member.queries"
import { getDiscoverHref, loadDiscoverParams } from "@/features/project/helpers/discover"
import { getLikedProjectIDs } from "@/features/project/like.queries"
import { getProjectsCached } from "@/features/project/project.queries"
import { DiscoverProjectsSkeleton } from "./DiscoverProjectsSkeleton"
import { DiscoverProjectsView } from "./DiscoverProjectsView"

interface DiscoverProjectsProps {
  /**
   * The page's search params, which hold the tab, sort, and page.
   */
  searchParams: Promise<SearchParams>
}

const logLikesError = (err: unknown) => {
  console.error("[DiscoverProjects] failed to load liked projects", { error: err })
}

const DiscoverProjectsContent = async ({ searchParams }: DiscoverProjectsProps) => {
  const state = await loadDiscoverParams(searchParams)
  const { projects, totalPages } = await getProjectsCached(state)

  // Send pages past the end, e.g. from an old link after projects were removed, to the last page
  if (totalPages > 0 && state.page > totalPages) {
    redirect(getDiscoverHref({ ...state, page: totalPages }))
  }

  // Not awaited, so the grid render isn't blocked and can be done purely under cached fetches
  const likedIDs = getCurrentMember()
    .then((member) =>
      getLikedProjectIDs(
        member,
        projects.map((project) => project.id),
      ),
    )
    .catch((err) => {
      logLikesError(err)
      return []
    })

  return (
    <DiscoverProjectsView
      {...state}
      likedIDs={likedIDs}
      projects={projects}
      totalPages={totalPages}
    />
  )
}

/**
 * The home page's Discover section: a filterable, sortable, paginated list of projects. It reads
 * its state from the URL and fetches the matching page of projects.
 */
export const DiscoverProjects = ({ searchParams }: DiscoverProjectsProps) => (
  <AnimatedSuspense fallback={<DiscoverProjectsSkeleton />}>
    <DiscoverProjectsContent searchParams={searchParams} />
  </AnimatedSuspense>
)
