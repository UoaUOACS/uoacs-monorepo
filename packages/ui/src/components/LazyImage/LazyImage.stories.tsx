import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LazyImage } from "./LazyImage"

const meta: Meta<typeof LazyImage> = {
  title: "Primitive Components/LazyImage",
  component: LazyImage,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
    className: { control: "text" },
  },
  args: {
    src: "https://placehold.co/600x400",
    alt: "Placeholder Image",
    width: 600,
    height: 400,
  },
}

export default meta
type Story = StoryObj<typeof LazyImage>

export const Primary: Story = {}

export const FocalPoint: Story = {
  args: {
    src: "https://placehold.co/1200x400",
    width: 300,
    height: 300,
    className: "object-cover!",
    focalPoint: { focalX: 90, focalY: 50 },
  },
}
