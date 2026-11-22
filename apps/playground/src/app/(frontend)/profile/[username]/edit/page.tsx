import { AnimatedSuspense } from "@uoacs/ui"
import { notFound, redirect } from "next/navigation"
import { redirectToLogin } from "@/features/auth/auth.helpers"
import { editAuthMemberDetails } from "@/features/member/actions/editAuthMemberDetails"
import { MemberDetailsForm } from "@/features/member/components/MemberDetailsForm/MemberDetailsForm"
import {
  getAuthMember,
  getCurrentMember,
  getMemberByUsernameCached,
} from "@/features/member/member.queries"
import { EditProfileForm } from "@/features/profile/components/EditProfileForm/EditProfileForm"
import { EditProfileTabs } from "@/features/profile/components/EditProfileTabs/EditProfileTabs"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader/ProfileHeader"
import { ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader/ProfileHeaderView"
import { Routes } from "@/lib/routes"

const EditProfileContent = async ({
  params,
}: Pick<PageProps<"/profile/[username]/edit">, "params">) => {
  const { username } = await params

  const current = await getCurrentMember()
  if (current.status === "unauthenticated") redirectToLogin(Routes.PROFILE.USERNAME(username))
  if (current.status === "unavailable") redirect(Routes.HOME)

  const member = await getMemberByUsernameCached(username)
  const authMember = await getAuthMember()

  if (!member || !authMember || current.member.id !== member.id) notFound()

  return (
    <>
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader member={member} />
      </AnimatedSuspense>

      <EditProfileTabs
        tabs={[
          {
            id: "general",
            label: "General",
            content: <MemberDetailsForm member={authMember} onSave={editAuthMemberDetails} />,
          },
          {
            id: "edit-profile",
            label: "Edit Profile",
            content: <EditProfileForm key={member.username} member={member} />,
          },
        ]}
      />
    </>
  )
}

export default function EditProfilePage(props: PageProps<"/profile/[username]/edit">) {
  return (
    <div className="mx-auto flex w-full flex-col gap-10 px-4 py-10">
      <AnimatedSuspense fallback={<ProfileHeaderSkeleton />}>
        <EditProfileContent params={props.params} />
      </AnimatedSuspense>
    </div>
  )
}
