import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LazyImage } from "../LazyImage/LazyImage"
import { ImageLightbox } from "./ImageLightbox"

const meta: Meta<typeof ImageLightbox> = {
  title: "Primitive Components/ImageLightbox",
  component: ImageLightbox,
  args: {
    images: [
      {
        src: "https://placehold.co/1920x1080",
        alt: "Landscape screenshot",
        width: 1920,
        height: 1080,
      },
    ],
  },
  render: (args) => (
    <div className="size-48 overflow-hidden rounded-xl">
      <ImageLightbox {...args}>
        <LazyImage
          alt=""
          className="object-cover!"
          containerClassName="size-full"
          fill
          sizes="192px"
          src={args.images[args.index ?? 0]?.src ?? ""}
        />
      </ImageLightbox>
    </div>
  ),
}

export default meta
type Story = StoryObj<typeof ImageLightbox>

export const Landscape: Story = {}

export const Portrait: Story = {
  args: {
    images: [
      { src: "https://placehold.co/1080x1920", alt: "Portrait poster", width: 1080, height: 1920 },
    ],
  },
}

export const Several: Story = {
  args: {
    index: 1,
    images: [
      { src: "https://placehold.co/1920x1080?text=1", alt: "Image 1", width: 1920, height: 1080 },
      { src: "https://placehold.co/1080x1620?text=2", alt: "Image 2", width: 1080, height: 1620 },
      { src: "https://placehold.co/1200x1200?text=3", alt: "Image 3", width: 1200, height: 1200 },
    ],
  },
}
