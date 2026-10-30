import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { SearchBar } from "./SearchBar"

const meta = {
  title: "Components/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 610, maxWidth: "calc(100vw - 2rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  name: "With value",
  args: { defaultValue: "hackathon" },
}

/** The parent owns the text; the clear button still empties it via `onChange`. */
export const Controlled: Story = {
  render: (args) => {
    const [query, setQuery] = useState("hackathon")
    return (
      <div className="flex flex-col gap-4">
        <SearchBar {...args} onValueChange={setQuery} value={query} />
        <p className="font-mono text-sm text-gray-500">query: "{query}"</p>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "hackathon" },
}

/** Below the `md` breakpoint the bar is shorter, with smaller text and icons. */
export const Mobile: Story = {
  args: { defaultValue: "hackathon" },
  globals: { viewport: { value: "mobile2", isRotated: false } },
}
