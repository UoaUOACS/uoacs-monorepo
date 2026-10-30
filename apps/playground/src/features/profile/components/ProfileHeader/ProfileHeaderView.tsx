import { UserIcon } from "@heroicons/react/24/outline"
import { Heading, LazyImage, Skeleton } from "@uoacs/ui"
import type { Member } from "@/payload/payload-types"
import { ProfileHeaderButton } from "./ProfileHeaderButton"

const LAYOUT_CLASS_NAME = "flex flex-col gap-6 md:flex-row md:items-center md:gap-12"
const AVATAR_CLASS_NAME =
  "relative size-28 shrink-0 overflow-hidden rounded-full bg-gray-200 md:size-52"
// The button's height, kept when there's no button so the header is the same size for everyone
const ACTION_CLASS_NAME = "h-6.5 md:h-8.5"

export interface ProfileHeaderProps {
  /**
   * The member's playground profile, for their profile picture and username.
   */
  member: Member
}

export interface ProfileHeaderViewProps extends ProfileHeaderProps {
  /**
   * Whether the signed-in member owns this profile, which shows them the "your account" label and
   * the edit button.
   */
  isOwner: boolean
}

const AccountLabel = () => (
  <p className="font-mono">
    <span className="text-primary">/&#47; </span>YOUR ACCOUNT
  </p>
)

// Takes the label's line when it's hidden, so the header is the same height for everyone
const AccountLabelSpacer = () => <div aria-hidden="true" className="h-lh font-mono" />

/**
 * The layout of the top of a member's profile: their profile picture, name, username and a
 * "your account" label and edit button for the profile's owner. {@link ProfileHeader} works out
 * who the owner is.
 */
export const ProfileHeaderView = ({ member, isOwner }: ProfileHeaderViewProps) => {
  const { profilePicture } = member
  const name = `${member.firstName} ${member.lastName}`
  const profilePictureURL = typeof profilePicture === "object" ? profilePicture?.url : undefined

  return (
    <header className={LAYOUT_CLASS_NAME}>
      <div className={AVATAR_CLASS_NAME}>
        {profilePictureURL ? (
          <LazyImage
            alt={name}
            className="object-cover!"
            containerClassName="h-full w-full"
            fill
            sizes="208px"
            src={profilePictureURL}
          />
        ) : (
          <UserIcon aria-hidden="true" className="size-full p-[20%] text-gray-400" />
        )}
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col items-start gap-2">
          {isOwner ? <AccountLabel /> : <AccountLabelSpacer />}
          <Heading className="justify-start text-left" h={2} period>
            {name}
          </Heading>
          <p className="font-neulis font-bold text-black">@{member.username}</p>
        </div>
        <div className={ACTION_CLASS_NAME}>
          {isOwner && <ProfileHeaderButton username={member.username} />}
        </div>
      </div>
    </header>
  )
}

/**
 * A loading placeholder with the same layout as {@link ProfileHeaderView}.
 */
export const ProfileHeaderSkeleton = () => (
  <div aria-hidden="true" className={LAYOUT_CLASS_NAME}>
    <Skeleton className={AVATAR_CLASS_NAME} shape="circle" />

    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-col items-start gap-2">
        <AccountLabelSpacer />
        <Skeleton className="heading-2 w-72" shape="text" />
        <Skeleton className="h-6 w-64" shape="text" />
      </div>
      {/* Most visitors aren't the owner, so keep the button's space without showing one */}
      <div className={ACTION_CLASS_NAME} />
    </div>
  </div>
)
