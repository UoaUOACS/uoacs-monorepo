import { AnimatedSuspense } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { getMemberByUsernameCached } from "@/features/member/member.queries"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader/ProfileHeader"
import { ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader/ProfileHeaderView"

const ProfileHeaderLoader = async ({
  params,
}: Pick<LayoutProps<"/profile/[username]">, "params">) => {
  const { username } = await params

  const member = await getMemberByUsernameCached(username)
  if (!member) notFound()

  return <ProfileHeader member={member} />
}

export default function ProfileLayout({
  params,
  children,
}: Pick<LayoutProps<"/profile/[username]">, "params" | "children">) {
  return (
    <div className="mx-auto flex w-full flex-col gap-10 px-4 py-10">
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderLoader params={params} />
      </AnimatedSuspense>

      {children}
    </div>
  )
}
