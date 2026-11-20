import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { EditProfileTabs } from "./EditProfileTabs"

const meta = {
  title: "Features/Profile/EditProfileTabs",
  component: EditProfileTabs,
  parameters: {
    layout: "padded",
  },
  args: {
    tabs: [
      {
        id: "general",
        label: "General",
        content: <div className="rounded border p-6">General form content</div>,
      },
      {
        id: "edit-profile",
        label: "Edit Profile",
        content: <div className="rounded border p-6">Edit profile form content</div>,
      },
    ],
  },
} satisfies Meta<typeof EditProfileTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const EditProfileSelected: Story = {
  args: {
    defaultTabId: "edit-profile",
  },
}

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: "general", label: "General", content: <div className="p-6">General</div> },
      {
        id: "edit-profile",
        label: "Edit Profile",
        content: <div className="p-6">Edit Profile</div>,
      },
      { id: "privacy", label: "Privacy", content: <div className="p-6">Privacy</div> },
      {
        id: "notifications",
        label: "Notifications",
        content: <div className="p-6">Notifications</div>,
      },
    ],
  },
}
