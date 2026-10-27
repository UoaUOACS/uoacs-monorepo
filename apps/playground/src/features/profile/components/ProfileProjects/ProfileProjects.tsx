import { AnimatedSuspense } from "@uoacs/ui"
import { unstable_rethrow } from "next/navigation"
import { getCurrentMember } from "@/features/member/member.queries"
import { getLikedProjectIDs } from "@/features/project/like.queries"
import { getProjectsByAuthorCached } from "@/features/project/project.queries"
import { ProfileProjectsSkeleton, ProfileProjectsView } from "./ProfileProjectsView"

interface ProfileProjectsProps {
  /**
   * The ID of the member whose profile this is.
   */
  memberID: string
}

// The session only decides the owner's link and liked hearts, so show the visitor's view on failure
const logSessionError = (error: unknown) => {
  unstable_rethrow(error)
  console.error("[ProfileProjects] Failed to load the session's member data", { error })
}

const ProfileProjectsContent = async ({ memberID }: ProfileProjectsProps) => {
  const [projects, current] = await Promise.all([
    getProjectsByAuthorCached(memberID),
    getCurrentMember().catch((error) => {
      logSessionError(error)
      return { status: "unavailable" } as const
    }),
  ])

  const likedIDs = await getLikedProjectIDs(
    current,
    projects.map((project) => project.id),
  ).catch((error) => {
    logSessionError(error)
    return []
  })

  return (
    <ProfileProjectsView
      isOwner={current.status === "authenticated" && current.member.id === memberID}
      likedIDs={likedIDs}
      projects={projects}
    />
  )
}

/**
 * The profile's "Projects" tab, which fetches the member's projects and checks who is viewing.
 */
export const ProfileProjects = ({ memberID }: ProfileProjectsProps) => (
  <AnimatedSuspense fallback={<ProfileProjectsSkeleton />}>
    <ProfileProjectsContent memberID={memberID} />
  </AnimatedSuspense>
)
