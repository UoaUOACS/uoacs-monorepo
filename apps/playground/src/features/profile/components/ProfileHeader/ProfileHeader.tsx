import { unstable_rethrow } from "next/navigation"
import { getCurrentMember } from "@/features/member/member.queries"
import { type ProfileHeaderProps, ProfileHeaderView } from "./ProfileHeaderView"

/**
 * The top of a member's profile, with an edit button only the profile's owner sees. Checking the
 * owner reads the session, so render this behind a `Suspense` boundary with
 * `ProfileHeaderSkeleton` as the fallback.
 */
export const ProfileHeader = async (props: ProfileHeaderProps) => {
  // Show the visitor's view whenever ownership can't be confirmed, e.g. the auth service is down
  let isOwner = false

  try {
    const current = await getCurrentMember()
    isOwner = current.status === "authenticated" && current.member.id === props.member.id
  } catch (error) {
    unstable_rethrow(error)
    console.error("[ProfileHeader] Failed to check the profile owner", {
      memberId: props.member.id,
      error,
    })
  }

  return <ProfileHeaderView {...props} isOwner={isOwner} />
}
