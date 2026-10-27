import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Toaster } from "@uoacs/ui/toast"
import { mockMember } from "@/features/profile/mocks/Member.mock"
import { EditProfileForm } from "./EditProfileForm"

const meta = {
  title: "Profile/EditProfileForm",
  component: EditProfileForm,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  args: {
    member: {
      ...mockMember,
      profilePicture: {
        id: "68e380871023ec09c1a45eb3",
        alt: "Jane Doe",
        url: "https://placehold.co/240x240?text=PFP",
        createdAt: "2026-01-04T02:22:09.601Z",
        updatedAt: "2026-01-04T02:22:09.601Z",
      },
      bio: "Hi, I'm Jane! I'm a student who enjoys learning new things, spending time with friends and family, and exploring my interests.",
      skills: ["Python", "UI/UX Design"],
      links: [{ name: "GITHUB", url: "https://github.com/janedoe" }],
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof EditProfileForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { member: mockMember },
}
