import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { mockMember } from "@/features/profile/mocks/Member.mock"
import { Routes } from "@/lib/routes"
import { ProfileHeaderSkeleton, ProfileHeaderView } from "./ProfileHeaderView"

const meta = {
  title: "Profile/ProfileHeader",
  component: ProfileHeaderView,
  args: { member: mockMember, isOwner: true },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: Routes.PROFILE.USERNAME(mockMember.username) },
    },
  },
} satisfies Meta<typeof ProfileHeaderView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Visitor: Story = {
  name: "Visitor (not the owner)",
  args: { isOwner: false },
}

export const EditPage: Story = {
  name: "Owner on the edit page",
  parameters: {
    nextjs: { navigation: { pathname: Routes.PROFILE.EDIT } },
  },
}

export const WithProfilePicture: Story = {
  args: {
    member: {
      ...mockMember,
      profilePicture: {
        id: "68e380871023ec09c1a45eb3",
        alt: "Profile picture",
        url: "https://placehold.co/240x240?text=PFP",
        createdAt: "2026-01-04T02:22:09.601Z",
        updatedAt: "2026-01-04T02:22:09.601Z",
      },
    },
  },
}

export const LongName: Story = {
  args: {
    member: { ...mockMember, firstName: "Maximiliana Alexandria", lastName: "Montgomery" },
  },
}

export const Loading: Story = {
  render: () => <ProfileHeaderSkeleton />,
}
