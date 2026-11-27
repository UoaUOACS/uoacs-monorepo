import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useId, useState } from "react"
import { Tabs } from "./Tabs"

const TABS = [
  { value: "discover", label: "Discover" },
  { value: "featured", label: "Featured" },
  { value: "awards", label: "Awards", disabledReason: "Coming soon" },
]

/**
 * Button-mode tabs that keep their own state, so the story can be clicked through.
 */
const InteractiveTabs = () => {
  const id = useId()
  const [activeTab, setActiveTab] = useState(TABS[0].value)

  return <Tabs activeTab={activeTab} id={id} onTabChange={setActiveTab} tabs={TABS} />
}

const meta: Meta<typeof Tabs> = {
  title: "Primitive Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  render: () => <InteractiveTabs />,
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {}

export const WithLinks: Story = {
  name: "With links",
  render: () => <Tabs activeTab="discover" getHref={(tab) => `?tab=${tab}`} tabs={TABS} />,
}
