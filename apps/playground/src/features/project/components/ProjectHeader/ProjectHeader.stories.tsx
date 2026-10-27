import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { mockMember } from "@/features/profile/mocks/Member.mock"
import { LikeButton } from "@/features/project/components/LikeButton/LikeButton"
import { ProjectHeader, ProjectHeaderSkeleton } from "./ProjectHeader"

const project = {
  name: "UOACS Socials",
  summary:
    "Posters and social media posts for UOACS events, made to keep the club's branding consistent.",
  author: mockMember,
}

const meta = {
  title: "Project/ProjectHeader",
  component: ProjectHeader,
  parameters: { layout: "padded" },
  args: {
    project,
    actions: (
      <LikeButton
        className="flex items-center gap-1"
        countClassName="text-gray-500 text-sm font-medium"
        iconClassName="size-6 stroke-2 text-gray-900"
        likes={42}
        projectID="1"
      />
    ),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithProfilePicture: Story = {
  args: {
    project: {
      ...project,
      author: {
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
  },
}

export const LongName: Story = {
  args: {
    project: { ...project, name: "A Very Long Project Name That Wraps" },
  },
}

export const UnknownAuthor: Story = {
  args: { project: { ...project, author: "68e380871023ec09c1a45eb1" } },
}

export const Loading: Story = {
  render: () => <ProjectHeaderSkeleton />,
}
