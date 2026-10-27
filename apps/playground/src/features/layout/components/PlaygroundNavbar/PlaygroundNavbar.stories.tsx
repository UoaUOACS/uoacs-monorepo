import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlaygroundNavbar } from "./PlaygroundNavbar"

const meta: Meta<typeof PlaygroundNavbar> = {
  title: "Features/Layout/PlaygroundNavbar",
  component: PlaygroundNavbar,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
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

export const Home: Story = {}

export const Regular: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/events",
      },
    },
  },
}
