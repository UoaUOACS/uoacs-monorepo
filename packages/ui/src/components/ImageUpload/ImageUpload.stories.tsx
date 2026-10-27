import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { ImageUpload } from "./ImageUpload"

const meta: Meta<typeof ImageUpload> = {
  title: "Primitive Components/ImageUpload",
  component: ImageUpload,
  argTypes: {
    src: { control: "text" },
    label: { control: "text" },
    error: { control: "text" },
    accept: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    busy: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [file, setFile] = useState<File | null>(null)
    return <ImageUpload {...args} onChange={setFile} value={file} />
  },
}

export default meta
type Story = StoryObj<typeof ImageUpload>

export const Primary: Story = {}

export const WithImage: Story = {
  args: { src: "https://placehold.co/400x300" },
}

export const WithError: Story = {
  args: { error: "Upload a cover image" },
}

export const Disabled: Story = {
  args: { src: "https://placehold.co/400x300", disabled: true },
}

export const Busy: Story = {
  args: { src: "https://placehold.co/400x300", busy: true },
}

export const BrokenImage: Story = {
  args: { src: "https://image.invalid/cover.png" },
}
