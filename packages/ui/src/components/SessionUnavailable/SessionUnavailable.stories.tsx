import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SessionUnavailable } from "./SessionUnavailable"

// The component centres itself inside the page's `<main>`, so the decorator
// stands in for that flex parent: without a height the centring does nothing.
const meta = {
  title: "Primitive Components/SessionUnavailable",
  component: SessionUnavailable,
  decorators: [
    (Story) => (
      <div className="flex min-h-96 flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionUnavailable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
