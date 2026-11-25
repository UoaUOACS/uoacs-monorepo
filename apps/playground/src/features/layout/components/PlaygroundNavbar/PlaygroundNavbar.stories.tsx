import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlaygroundNavbar } from "./PlaygroundNavbar"

const meta: Meta<typeof PlaygroundNavbar> = {
  title: "Features/Layout/PlaygroundNavbar",
  component: PlaygroundNavbar,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  argTypes: {
    signedIn: { control: "boolean" },
    logoHref: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PlaygroundNavbar>

export const SignedOut: Story = {
  args: {
    signedIn: false,
  },
}

export const SignedIn: Story = {
  args: {
    signedIn: true,
  },
}
