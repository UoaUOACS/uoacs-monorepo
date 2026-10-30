import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { type FileRejection, FileUpload } from "./FileUpload"
import { FILE_REJECTION_MESSAGES } from "./FileUpload.constants"

const meta: Meta<typeof FileUpload> = {
  title: "Primitive Components/FileUpload",
  component: FileUpload,
  args: {
    label: "Upload file",
    error: undefined,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    maxSize: { control: "number" },
    maxFiles: { control: "number" },
    hideWhenFull: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    previewVariant: { control: "inline-radio", options: ["row", "card"] },
    containerClassName: { control: "text" },
  },
  render: (args) => {
    const [files, setFiles] = useState<File[]>([])
    return <FileUpload {...args} onChange={setFiles} value={files} />
  },
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Primary: Story = {}

export const ImagesOnly: Story = {
  args: {
    label: "Profile picture",
    hint: "PNG or JPEG, up to 2 MB",
    accept: "image/png,image/jpeg",
    maxSize: 2 * 1024 * 1024,
  },
}

export const Multiple: Story = {
  args: {
    label: "Project images",
    accept: "image/*",
    multiple: true,
  },
}

export const CardPreview: Story = {
  args: {
    label: "Project images",
    accept: "image/*",
    multiple: true,
    previewVariant: "card",
  },
}

export const HideWhenFull: Story = {
  args: {
    label: "Project images",
    hint: "Up to 3 images",
    accept: "image/*",
    multiple: true,
    maxFiles: 3,
    hideWhenFull: true,
    previewVariant: "card",
  },
}

export const WithRejections: Story = {
  args: {
    label: "Project images",
    hint: "Up to 3 images, 1 MB each",
    accept: "image/*",
    multiple: true,
    maxFiles: 3,
    maxSize: 1024 * 1024,
  },
  render: (args) => {
    const [files, setFiles] = useState<File[]>([])
    const [rejections, setRejections] = useState<FileRejection[]>([])
    return (
      <div className="flex flex-col gap-2">
        <FileUpload {...args} onChange={setFiles} onReject={setRejections} value={files} />
        <p className="font-mono text-sm text-gray-500">
          onReject:{" "}
          {rejections.length > 0
            ? rejections
                .map(({ file, reason }) => `${file.name}: ${FILE_REJECTION_MESSAGES[reason]}`)
                .join(", ")
            : "none"}
        </p>
      </div>
    )
  },
}

export const WithError: Story = {
  args: {
    error: "A cover image is required",
  },
}

export const Required: Story = {
  args: {
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
