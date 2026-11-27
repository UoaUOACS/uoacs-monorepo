import { AnimatedSuspense } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { getMemberByUsernameCached } from "@/features/member/member.queries"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader/ProfileHeader"
import { ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader/ProfileHeaderView"

export default async function ProfileLayout({
  params,
  children,
}: Pick<LayoutProps<"/profile/[username]">, "params" | "children">) {
  const { username } = await params

  const member = await getMemberByUsernameCached(username)
  if (!member) notFound()

  return (
    <div className="mx-auto flex w-full flex-col gap-10 px-4 py-10">
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader member={member} />
      </AnimatedSuspense>

      {children}
    </div>
  )
}
