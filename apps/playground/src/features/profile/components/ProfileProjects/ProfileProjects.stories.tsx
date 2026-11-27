import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { mocked } from "storybook/test"
import { getCurrentMember } from "@/features/member/member.queries"
import type { Project } from "@/features/project/components/ProjectCard/ProjectCard"
import type { Member } from "@/payload/payload-types"
import { ProfileProjectsSkeleton, ProfileProjectsView } from "./ProfileProjectsView"

const AUTHOR_ID = "author-1"

// Signs the project's author in, which shows the owner's actions menu
const signInAsAuthor = () => {
  mocked(getCurrentMember).mockResolvedValue({
    status: "authenticated",
    member: { id: AUTHOR_ID } as Member,
  })
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Project Playground",
    imageURL: "https://placehold.co/400x300",
    authorID: AUTHOR_ID,
    authorName: "jane-doe",
    likes: 1000,
    summary: "A playground where UOACS members can showcase and discover projects.",
  },
  {
    id: "2",
    title: "Events Hub",
    imageURL: "https://placehold.co/400x300",
    authorID: AUTHOR_ID,
    authorName: "jane-doe",
    likes: 23,
    summary: "Every UOACS event in one place.",
  },
]

const meta = {
  title: "Profile/ProfileProjects",
  component: ProfileProjectsView,
  parameters: { layout: "padded" },
  args: { projects: mockProjects, likedIDs: ["2"], isOwner: true },
  argTypes: { projects: { control: false } },
} satisfies Meta<typeof ProfileProjectsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach: signInAsAuthor,
}

export const Visitor: Story = {
  name: "Visitor (not the owner)",
  args: { isOwner: false },
}

export const Empty: Story = {
  name: "Empty (owner)",
  args: { projects: [] },
}

export const EmptyVisitor: Story = {
  name: "Empty (visitor)",
  args: { projects: [], isOwner: false },
}

export const Loading: Story = {
  render: () => <ProfileProjectsSkeleton />,
}
