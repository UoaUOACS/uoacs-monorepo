import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { RichTextValue } from "@uoacs/shared/payload"
import { useEffect, useState } from "react"
import { fn } from "storybook/test"
import {
  type BlockValue,
  type MediaLookup,
  projectFormOptions,
  setSaveErrors,
} from "@/features/project/editor/projectForm.options"
import { useAppForm } from "@/lib/form/useAppForm"
import { Slugs } from "@/lib/payload/slugs"
import { BlockFrame } from "./BlockFrame"

const objectID = (n: number) => n.toString(16).padStart(24, "0")

const media: MediaLookup = Object.fromEntries(
  [1, 2, 3].map((n) => [
    objectID(n),
    {
      id: objectID(n),
      src: `https://placehold.co/1200x900?text=${n}`,
      alt: `Image ${n}`,
      width: 1200,
      height: 900,
    },
  ]),
)

const content = {
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "At UOACS, our mission is to bring Computer Science students together.",
            version: 1,
          },
        ],
      },
    ],
  },
} as unknown as RichTextValue

const blocks = {
  text: { _key: "text", blockType: Slugs.Blocks.TEXT, content },
  emptyText: { _key: "empty-text", blockType: Slugs.Blocks.TEXT, content: null },
  imageGrid: {
    _key: "image-grid",
    blockType: Slugs.Blocks.IMAGE_GRID,
    images: [objectID(1), objectID(2), objectID(3)],
  },
  emptyImageGrid: { _key: "empty-image-grid", blockType: Slugs.Blocks.IMAGE_GRID, images: [] },
} satisfies Record<string, BlockValue>

interface ExampleProps {
  block: BlockValue
  active?: boolean
  error?: string
}

// One block in a form, as `BlockList` renders it
const Example = ({ block, active: initialActive = false, error }: ExampleProps) => {
  const [active, setActive] = useState(initialActive)
  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: { ...projectFormOptions.defaultValues, pageContent: [block] },
  })
  // Stands in for a failed save
  useEffect(() => {
    if (error) setSaveErrors(form, { "pageContent[0].content": error })
  }, [error, form])

  return (
    <BlockFrame
      active={active}
      form={form}
      index={0}
      isFirst
      isLast
      media={media}
      onActivate={() => setActive(true)}
      onDeactivate={() => setActive(false)}
      onDelete={fn()}
      onMove={fn()}
      onUpload={fn()}
    />
  )
}

const meta = {
  title: "Project/ProjectEditor/BlockFrame",
  component: Example,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl pb-40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = { args: { block: blocks.text } }

export const EmptyText: Story = { args: { block: blocks.emptyText } }

export const ActiveText: Story = { args: { block: blocks.text, active: true } }

export const ImageGrid: Story = { args: { block: blocks.imageGrid } }

export const EmptyImageGrid: Story = { args: { block: blocks.emptyImageGrid } }

export const ActiveImageGrid: Story = { args: { block: blocks.imageGrid, active: true } }

export const WithError: Story = { args: { block: blocks.emptyText, error: "Add some text" } }
