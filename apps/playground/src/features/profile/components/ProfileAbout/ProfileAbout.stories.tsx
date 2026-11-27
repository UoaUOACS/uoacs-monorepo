import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ProfileAbout, ProfileAboutSkeleton } from "./ProfileAbout"

const meta = {
  title: "Profile/ProfileAbout",
  component: ProfileAbout,
  args: {
    // major: ["Computer Science and Finance"],
    biography:
      "Hi, I'm Louise Wang! I'm a student who enjoys learning new things, spending time with friends and family, and exploring my interests. I'm always looking for new experiences and opportunities to grow, improve my skills, and have fun along the way.",
    languages: ["English", "Chinese"],
    skills: ["Python", "UI/UX Design"],
  },
} satisfies Meta<typeof ProfileAbout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Partial: Story = {
  args: {
    // major: undefined,
    languages: undefined,
    skills: undefined,
  },
}

export const Empty: Story = {
  args: {
    // major: undefined,
    biography: undefined,
    languages: undefined,
    skills: undefined,
  },
}

export const Loading: Story = {
  render: () => <ProfileAboutSkeleton />,
}
