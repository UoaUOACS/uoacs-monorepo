import { PencilIcon } from "@heroicons/react/24/outline"
import { Button } from "@uoacs/ui"
import Link from "next/link"
import { unstable_rethrow } from "next/navigation"
import { getCurrentMember } from "@/features/member/member.queries"
import { LikeButton } from "@/features/project/components/LikeButton/LikeButton"
import { getLikedProjectIDs } from "@/features/project/like.queries"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Routes } from "@/lib/routes"
import type { Project } from "@/payload/payload-types"

// Liked state and the edit link are extras, so show the page without them rather than fail it
const logSessionError = (err: unknown) => {
  unstable_rethrow(err)
  console.error("[ProjectHeaderActions] failed to load the viewer's state", { error: err })
}

/**
 * The like button and, for the author, an edit link. Reads the session, so render it in Suspense.
 */
export const ProjectHeaderActions = async ({
  project,
}: {
  project: Pick<Project, "id" | "author" | "likeCount">
}) => {
  const member = await getCurrentMember().catch((err) => {
    logSessionError(err)
    return { status: "unavailable" } as const
  })
  const likedIDs = await getLikedProjectIDs(member, [project.id]).catch((err): string[] => {
    logSessionError(err)
    return []
  })
  const isAuthor =
    member.status === "authenticated" && member.member.id === getRelationID(project.author)

  return (
    <div className="flex items-center justify-between gap-4 md:flex-row md:justify-end">
      <LikeButton
        className="flex items-center gap-1"
        countClassName="text-gray-500 text-sm font-medium"
        iconClassName="size-6 stroke-2 text-gray-900"
        isLiked={likedIDs.includes(project.id)}
        likes={project.likeCount ?? 0}
        projectID={project.id}
      />
      {isAuthor && (
        <Link href={Routes.PROJECTS.EDIT(project.id)}>
          <Button
            left={<PencilIcon className="size-4" />}
            shape="rounded"
            tabIndex={-1}
            theme="dark"
          >
            Edit
          </Button>
        </Link>
      )}
    </div>
  )
}
