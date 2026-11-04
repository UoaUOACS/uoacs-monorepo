import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { Project } from "../ProjectCard/ProjectCard"
import { ProjectGrid } from "./ProjectGrid"

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Project Playground",
    imageURL: "https://placehold.co/400x300",
    authorName: "Name Of Author",
    likes: 1000,
    awardType: "Best Design",
  },
  {
    id: "2",
    title: "Committee Portal",
    imageURL: "https://placehold.co/400x300",
    authorName: "Name Of Author",
    likes: 23,
  },
  { id: "3", title: "Events Hub", authorName: "Name Of Author", likes: 31415 },
  {
    id: "4",
    title: "Sponsorship Tracker",
    imageURL: "https://placehold.co/400x300",
    authorName: "Name Of Author",
    likes: 10000,
  },
  {
    id: "5",
    title: "Alumni Directory",
    imageURL: "https://placehold.co/400x300",
    authorName: "Name Of Author",
    likes: 0,
  },
]

const meta = {
  title: "Components/ProjectGrid",
  component: ProjectGrid,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProjectGrid>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeAcross: Story = {
  args: {
    projects: mockProjects,
  },
}

export const WithLikedProjects: Story = {
  name: "With liked projects",
  args: {
    projects: mockProjects,
    likedIDs: Promise.resolve(["1", "3"]),
  },
}

export const SingleProject: Story = {
  args: {
    projects: [mockProjects[0]],
  },
}

export const Empty: Story = {
  name: "Empty tab (no projects)",
  args: {
    projects: [],
  },
}
