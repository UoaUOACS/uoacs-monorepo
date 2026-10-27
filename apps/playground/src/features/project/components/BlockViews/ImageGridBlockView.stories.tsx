import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { GalleryImage } from "@uoacs/ui"
import { ImageGridBlockView } from "./ImageGridBlockView"

const image = (width: number, height: number, index: number): GalleryImage => ({
  id: String(index),
  src: `https://placehold.co/${width}x${height}?text=${index + 1}`,
  alt: `Image ${index + 1}`,
  width,
  height,
})

const images = (count: number) =>
  Array.from({ length: count }, (_, index) => image(1920, 1080, index))

const meta = {
  title: "Project/Blocks/ImageGridBlockView",
  component: ImageGridBlockView,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageGridBlockView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { images: images(3) },
}

export const OneImage: Story = {
  args: { images: images(1) },
}

export const ManyImages: Story = {
  args: { images: images(12) },
}

// Small and large sizes, and portrait, square, landscape and panorama shapes
export const MixedShapes: Story = {
  args: {
    images: [
      [1920, 1080],
      [800, 1200],
      [400, 400],
      [3000, 1000],
      [1080, 1920],
      [1200, 900],
      [640, 360],
      [2000, 2600],
    ].map(([width = 0, height = 0], index) => image(width, height, index)),
  },
}

export const Compact: Story = {
  args: { images: images(2), compact: true },
}

export const CompactManyImages: Story = {
  args: { images: images(12), compact: true },
}
