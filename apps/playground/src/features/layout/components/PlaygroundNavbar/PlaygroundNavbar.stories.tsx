import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, userEvent, within } from "storybook/test"
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("link", { name: /log in/i })).toBeVisible()
    await expect(canvas.queryByRole("link", { name: /create/i })).not.toBeInTheDocument()
  },
}

export const SignedIn: Story = {
  args: {
    signedIn: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Create links to the create project page", async () => {
      await expect(canvas.getByRole("link", { name: /create/i })).toHaveAttribute(
        "href",
        "/projects/create",
      )
    })

    await step("Profile menu opens with Profile and Log Out", async () => {
      await userEvent.click(canvas.getByRole("button", { expanded: false }))
      const menu = await canvas.findByRole("menu")
      await expect(within(menu).getByText("Profile")).toBeVisible()
      await expect(within(menu).getByText("Log Out")).toBeVisible()
    })

    await step("Navbar is sticky", async () => {
      await expect(getComputedStyle(canvas.getByRole("navigation")).position).toBe("sticky")
    })
  },
}
