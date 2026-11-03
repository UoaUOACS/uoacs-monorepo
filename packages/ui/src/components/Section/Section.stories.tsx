import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Section } from "./Section"

const meta: Meta<typeof Section> = {
  title: "Primitive Components/Section",
  component: Section,
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Our Team",
    subtitle: "These are the people who make this club possible.",
    children: <div className="h-32 w-full rounded-md bg-gray-100" />,
  },
}

export default meta

type Story = StoryObj<typeof Section>

export const Basic: Story = {}

export const WithoutSubtitle: Story = {
  args: {
    subtitle: undefined,
  },
}

export const WithTitleOverlay: Story = {
  args: {
    titleOverlay: <span className="text-accent-yellow absolute -top-2 -right-6 text-xs">New</span>,
  },
}
