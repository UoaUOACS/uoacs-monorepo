import { Bars3Icon, PlusIcon } from "@heroicons/react/24/solid"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "./Button"
import { type ButtonVariantProps, buttonVariants } from "./variants"

const themes = Object.keys(buttonVariants.variants.theme) as NonNullable<
  ButtonVariantProps["theme"]
>[]
const allSizes = Object.keys(buttonVariants.variants.size) as NonNullable<
  ButtonVariantProps["size"]
>[]
const iconSizes = allSizes.filter((size) => size.startsWith("icon"))
const sizes = allSizes.filter((size) => !size.startsWith("icon"))
const shapes = Object.keys(buttonVariants.variants.shape) as NonNullable<
  ButtonVariantProps["shape"]
>[]
const fonts = Object.keys(buttonVariants.variants.font) as NonNullable<ButtonVariantProps["font"]>[]

const meta: Meta<typeof Button> = {
  title: "Primitive Components/Button",
  component: Button,
  args: {
    children: "Button",
    theme: "primary",
  },
  argTypes: {
    theme: { control: { type: "select" }, options: themes },
    size: { control: { type: "select" }, options: allSizes },
    shape: { control: { type: "select" }, options: shapes },
    font: { control: { type: "select" }, options: fonts },
    left: { control: { type: "text" } },
    right: { control: { type: "text" } },
    disabled: { control: { type: "boolean" } },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    theme: "dark-primary",
    size: "md",
    shape: "pill",
    font: "cartograph",
    left: <PlusIcon className="h-5 w-5" />,
    children: "Create",
  },
  argTypes: {
    left: { control: false },
  },
}

export const IconOnly: Story = {
  args: {
    size: "icon",
    "aria-label": "Menu",
    children: <Bars3Icon className="h-6 w-6" />,
  },
  argTypes: {
    children: { control: false },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

interface VariantTableProps<C extends string> {
  title: string
  columns: readonly C[]
  renderCell: (theme: (typeof themes)[number], column: C) => React.ReactNode
}

const VariantTable = <C extends string>({ title, columns, renderCell }: VariantTableProps<C>) => (
  <section className="flex flex-col gap-1">
    <h3 className="text-sm font-bold">{title}</h3>
    <table className="w-fit border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300" />
          {columns.map((column) => (
            <th
              className="border border-gray-300 px-3 py-2 text-left font-mono text-xs text-gray-500"
              key={column}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {themes.map((theme) => (
          <tr key={theme}>
            <th className="border border-gray-300 px-3 py-2 text-left font-mono text-xs text-gray-500">
              {theme}
            </th>
            {columns.map((column) => (
              <td className="border border-gray-300 p-4" key={column}>
                {renderCell(theme, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
)

export const AllVariants: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <VariantTable
        columns={sizes}
        renderCell={(theme, size) => (
          <Button size={size} theme={theme}>
            Button
          </Button>
        )}
        title="Theme × Size"
      />
      <VariantTable
        columns={shapes}
        renderCell={(theme, shape) => (
          <Button shape={shape} size="md" theme={theme}>
            Button
          </Button>
        )}
        title="Theme × Shape (size md)"
      />
      <VariantTable
        columns={fonts}
        renderCell={(theme, font) => (
          <Button
            font={font}
            left={<PlusIcon className="h-5 w-5" />}
            shape="pill"
            size="md"
            theme={theme}
          >
            Create
          </Button>
        )}
        title="Theme × Font (size md, pill, left icon)"
      />
      <VariantTable
        columns={iconSizes}
        renderCell={(theme, size) => (
          <Button aria-label="Menu" size={size} theme={theme}>
            <Bars3Icon className="h-6 w-6" />
          </Button>
        )}
        title="Theme × Icon size"
      />
    </div>
  ),
}
