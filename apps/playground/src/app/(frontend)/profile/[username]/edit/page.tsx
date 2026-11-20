import { AnimatedSuspense } from "@uoacs/ui"
import { notFound } from "next/navigation"
// import { MemberDetailsForm } from "@/features/member/components/MemberDetailsForm/MemberDetailsForm"
import { getMemberByUsernameCached } from "@/features/member/member.queries"
import { EditProfileForm } from "@/features/profile/components/EditProfileForm/EditProfileForm"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader/ProfileHeader"
import { ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader/ProfileHeaderView"

const EditProfileContent = async ({
  params,
}: Pick<PageProps<"/profile/[username]/edit">, "params">) => {
  const { username } = await params

  const member = await getMemberByUsernameCached(username)
  if (!member) notFound()

  return (
    <>
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader member={member} />
      </AnimatedSuspense>

      <EditProfileForm member={member} />
      {/* <MemberDetailsForm member={member} /> */}
    </>
  )
}

export default function EditProfilePage(props: PageProps<"/profile/[username]">) {
  return (
    <div className="mx-auto flex w-full flex-col gap-10 px-4 py-10">
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <EditProfileContent params={props.params} />
      </AnimatedSuspense>
    </div>
  )
}
