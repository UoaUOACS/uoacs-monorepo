import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { RichTextValue } from "@uoacs/shared/payload"
import { TextBlockView } from "./TextBlockView"

const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8

const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
})

const element = { direction: "ltr", format: "", indent: 0, version: 1 } as const

type Child = ReturnType<typeof text>

const paragraph = (...children: Child[]) => ({ ...element, type: "paragraph", children })
const heading = (tag: "h2" | "h3", value: string) => ({
  ...element,
  type: "heading",
  tag,
  children: [text(value)],
})
const list = (listType: "bullet" | "number", items: string[]) => ({
  ...element,
  type: "list",
  listType,
  start: 1,
  tag: listType === "bullet" ? "ul" : "ol",
  children: items.map((item, index) => ({
    ...element,
    type: "listitem",
    value: index + 1,
    children: [text(item)],
  })),
})
const quote = (value: string) => ({ ...element, type: "quote", children: [text(value)] })

const richText = (...children: object[]) =>
  ({ root: { ...element, type: "root", children } }) as unknown as RichTextValue

const ABOUT = [
  heading("h2", "About"),
  paragraph(
    text("In a 400-seat lecture, most questions never get asked. "),
    text("Echo", BOLD),
    text(" gives each lecture a short join code, collects questions "),
    text("anonymously", ITALIC),
    text(" and lets the class vote the best ones to the top."),
  ),
]

const FEATURES = [
  heading("h3", "Features"),
  list("bullet", [
    "Join with a four-letter code, no account needed",
    "Upvotes surface the most useful questions",
    "Lecturer view with a one-tap 'answered' button",
  ]),
]

const BUILD = [
  heading("h3", "How we built it"),
  list("number", [
    "Sketched the flows in Figma with two lecturers",
    "Built the realtime layer with Phoenix LiveView",
    "Ran a pilot in COMPSCI 101 and fixed what broke",
  ]),
  paragraph(
    text("Everything runs on "),
    text("one small server", UNDERLINE),
    text(", and the lecturer widget embeds straight into "),
    text("Canvas", BOLD | ITALIC),
    text("."),
  ),
]

const QUOTE = [quote("The quiet students finally get their questions answered.")]

const meta = {
  title: "Project/Blocks/TextBlockView",
  component: TextBlockView,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextBlockView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { content: richText(...ABOUT, ...FEATURES, ...QUOTE) },
}

export const ParagraphOnly: Story = {
  args: { content: richText(ABOUT[1]) },
}

export const LongText: Story = {
  args: {
    content: richText(
      ...ABOUT,
      ...FEATURES,
      ...BUILD,
      ...QUOTE,
      heading("h2", "What's next"),
      paragraph(
        text("Two COMPSCI lecturers are trialling Echo this semester. Next we want "),
        text("threaded replies", BOLD),
        text(", so tutors can answer in the app while the lecture keeps going."),
      ),
      paragraph(
        text("We also plan a summary email after each lecture with the top questions and their "),
        text("answers", ITALIC),
        text(", so students who missed the class can catch up."),
      ),
      paragraph(
        text("If you want to help, we need people who know "),
        text("accessibility", UNDERLINE),
        text(" testing and anyone keen to design a dark mode."),
      ),
    ),
  },
}

export const Empty: Story = {
  args: { content: null },
}

export const Compact: Story = {
  args: { content: richText(...ABOUT, ...FEATURES), compact: true },
}

export const CompactLongLine: Story = {
  args: { content: richText(ABOUT[1]), compact: true },
}

export const CompactEmpty: Story = {
  args: { content: null, compact: true },
}
