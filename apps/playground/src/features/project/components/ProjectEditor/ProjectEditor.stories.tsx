import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { RichTextValue } from "@uoacs/shared/payload"
import type { GalleryImage } from "@uoacs/ui"
import { Toaster } from "@uoacs/ui/toast"
import { mocked } from "storybook/test"
import { saveProject } from "@/features/project/actions/saveProject"
import {
  type BlockValue,
  type MediaLookup,
  projectFormOptions,
} from "@/features/project/editor/projectForm.options"
import { Slugs } from "@/lib/payload/slugs"
import { ProjectEditor } from "./ProjectEditor"
import { ProjectEditorSkeleton } from "./ProjectEditorSkeleton"

const objectID = (n: number) => n.toString(16).padStart(24, "0")

const image = (n: number): GalleryImage => ({
  id: objectID(n),
  src: `https://placehold.co/1200x900?text=${n}`,
  alt: `Image ${n}`,
  width: 1200,
  height: 900,
})

const media: MediaLookup = Object.fromEntries(
  Array.from({ length: 6 }, (_, i) => image(100 + i)).map((item) => [item.id, item]),
)

const richText = (text: string) =>
  ({
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
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
        },
      ],
    },
  }) as unknown as RichTextValue

const textBlock = (n: number, text: string): BlockValue => ({
  _key: objectID(n),
  id: objectID(n),
  blockType: Slugs.Blocks.TEXT,
  content: richText(text),
})

const imageGridBlock = (n: number, images: number[]): BlockValue => ({
  _key: objectID(n),
  id: objectID(n),
  blockType: Slugs.Blocks.IMAGE_GRID,
  images: images.map(objectID),
})

const header = {
  name: "UOACS Socials",
  summary: "Posters and social media posts for UOACS events.",
  coverImage: objectID(100),
  imageTitles: Object.fromEntries(Object.values(media).map((image) => [image.id, image.alt])),
}

const meta = {
  title: "Project/ProjectEditor",
  component: ProjectEditor,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  args: { initialValues: projectFormOptions.defaultValues },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-6xl">
        <Story />
        <Toaster />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {}

export const Edit: Story = {
  args: {
    projectID: objectID(1),
    coverImageURL: "https://placehold.co/800x600",
    media,
    initialValues: {
      ...header,
      pageContent: [
        textBlock(2, "UOACS"),
        textBlock(
          3,
          "At UOACS, our mission is to bring Computer Science students together and create a supportive community throughout university.",
        ),
        imageGridBlock(4, [100, 101, 102, 103, 104, 105]),
      ],
    },
  },
}

/**
 * Only the active block mounts an editor, so 35 blocks still load one Lexical editor
 */
export const LongPage: Story = {
  args: {
    ...Edit.args,
    initialValues: {
      ...header,
      pageContent: Array.from({ length: 35 }, (_, i) =>
        i % 3 === 2
          ? imageGridBlock(10 + i, [100 + (i % 6), 101 + (i % 5)])
          : textBlock(10 + i, `Section ${i + 1}. Some text about this part of the project.`),
      ),
    },
  },
}

/**
 * The save fails for a block far down the page, which scrolls into view and opens
 */
export const SaveError: Story = {
  ...LongPage,
  beforeEach: () => {
    mocked(saveProject).mockResolvedValue({
      ok: false,
      error: "invalid",
      fieldErrors: { "pageContent[30].content": "Add some text" },
    })
  },
}

export const Loading: Story = {
  render: () => <ProjectEditorSkeleton />,
}
