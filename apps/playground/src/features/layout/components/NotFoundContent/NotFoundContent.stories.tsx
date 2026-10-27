import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { NotFoundContent } from "./NotFoundContent"

const meta: Meta<typeof NotFoundContent> = {
  title: "Layout/NotFoundContent",
  component: NotFoundContent,
  parameters: { layout: "fullscreen" },
}

export default meta

type Story = StoryObj<typeof NotFoundContent>

export const Default: Story = {}
