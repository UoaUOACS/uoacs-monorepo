import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { type GalleryImage, ImageGallery } from "./ImageGallery"

const image = (width: number, height: number, index: number): GalleryImage => ({
  id: String(index),
  src: `https://placehold.co/${width}x${height}?text=${index + 1}`,
  alt: `Image ${index + 1}`,
  width,
  height,
})

const images = (sizes: [number, number][]) =>
  sizes.map(([width, height], index) => image(width, height, index))

const LANDSCAPE: [number, number] = [1920, 1080]
const PORTRAIT: [number, number] = [1080, 1620]

const meta: Meta<typeof ImageGallery> = {
  title: "Primitive Components/ImageGallery",
  component: ImageGallery,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ImageGallery>

export const OneLandscape: Story = {
  args: { images: images([LANDSCAPE]) },
}

export const OnePortrait: Story = {
  args: { images: images([PORTRAIT]) },
}

export const TwoLandscape: Story = {
  args: { images: images([LANDSCAPE, LANDSCAPE]) },
}

export const ThreePortrait: Story = {
  args: { images: images([PORTRAIT, PORTRAIT, PORTRAIT]) },
}

export const ManyPortrait: Story = {
  args: { images: images(Array.from({ length: 12 }, () => PORTRAIT)) },
}

export const MostlyLandscape: Story = {
  args: { images: images([LANDSCAPE, LANDSCAPE, [1600, 1000], LANDSCAPE, PORTRAIT]) },
}

export const Mixed: Story = {
  args: {
    images: images([LANDSCAPE, PORTRAIT, [1200, 1200], [2400, 900], PORTRAIT, LANDSCAPE]),
  },
}

export const TwoLandscapeTwoPortrait: Story = {
  args: {
    images: images([
      [1600, 1000],
      [1600, 1000],
      [1000, 1150],
      [900, 1100],
    ]),
  },
}

export const LandscapeAndPortrait: Story = {
  args: { images: images([LANDSCAPE, PORTRAIT]) },
}

export const UnknownSizes: Story = {
  args: {
    images: images([LANDSCAPE, LANDSCAPE, LANDSCAPE]).map(({ width, height, ...rest }) => rest),
  },
}
