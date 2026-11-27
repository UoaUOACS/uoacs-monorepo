import { AnimatedSuspense } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { getMemberByUsernameCached } from "@/features/member/member.queries"
import {
  ProfileAbout,
  ProfileAboutSkeleton,
} from "@/features/profile/components/ProfileAbout/ProfileAbout"
import { ProfileProjects } from "@/features/profile/components/ProfileProjects/ProfileProjects"
import { ProfileTabs } from "@/features/profile/components/ProfileTabs/ProfileTabs"

export default async function ProfilePage({
  params,
}: Pick<PageProps<"/profile/[username]">, "params">) {
  const { username } = await params

  const member = await getMemberByUsernameCached(username)
  if (!member) notFound()

  return (
    <ProfileTabs
      panels={{
        Projects: <ProfileProjects memberID={member.id} />,
        About: (
          <AnimatedSuspense fallback={<ProfileAboutSkeleton />}>
            <ProfileAbout biography={member.bio} skills={member.skills ?? undefined} />
          </AnimatedSuspense>
        ),
      }}
    />
  )
}
