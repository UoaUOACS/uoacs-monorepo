import { AnimatedSuspense } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { getMemberByUsernameCached } from "@/features/member/member.queries"
import { ProfileAbout } from "@/features/profile/components/ProfileAbout/ProfileAbout"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader/ProfileHeader"
import { ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader/ProfileHeaderView"
import { ProfileProjects } from "@/features/profile/components/ProfileProjects/ProfileProjects"
import { ProfileTabs } from "@/features/profile/components/ProfileTabs/ProfileTabs"

const ProfileContent = async ({ params }: Pick<PageProps<"/profile/[username]">, "params">) => {
  const { username } = await params

  const member = await getMemberByUsernameCached(username)
  if (!member) notFound()

  return (
    <>
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader member={member} />
      </AnimatedSuspense>

      <ProfileTabs
        panels={{
          Projects: <ProfileProjects memberID={member.id} />,
          About: <ProfileAbout biography={member.bio} skills={member.skills ?? undefined} />,
        }}
      />
    </>
  )
}

export default function ProfilePage(props: PageProps<"/profile/[username]">) {
  return (
    <div className="mx-auto flex w-full flex-col gap-10 px-4 py-10">
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileContent params={props.params} />
      </AnimatedSuspense>
    </div>
  )
}
