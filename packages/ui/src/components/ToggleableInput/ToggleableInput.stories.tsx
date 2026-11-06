import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input, MultiSelect, Radio, Select } from "@uoacs/ui"
import { useState } from "react"
import { ToggleableInput } from "./ToggleableInput"

const meta: Meta<typeof ToggleableInput> = {
  title: "Generic Components/ToggleableInput",
  component: ToggleableInput,
  args: {
    label: "Label",
    displayNode: "Display Value",
    onSave: () => {},
  },
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text" },
    containerClassName: { control: "text" },
  },
}

export default meta
type Story = StoryObj<typeof ToggleableInput>

export const WithInput: Story = {
  render: (args) => {
    const [value, setValue] = useState("John Doe")
    return (
      <ToggleableInput {...args} displayNode={value} label="Full Name">
        <Input onChange={(e) => setValue(e.target.value)} type="text" value={value} />
      </ToggleableInput>
    )
  },
}

export const WithInputEditing: Story = {
  render: (args) => {
    const [value, setValue] = useState("John Doe")
    return (
      <ToggleableInput {...args} defaultToggleState displayNode={value} label="Full Name">
        <Input onChange={(e) => setValue(e.target.value)} type="text" value={value} />
      </ToggleableInput>
    )
  },
}

export const WithSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState("Option 2")
    return (
      <ToggleableInput {...args} displayNode={value} label="Favourite">
        <Select onChange={setValue} options={["Option 1", "Option 2", "Option 3"]} value={value} />
      </ToggleableInput>
    )
  },
}

export const WithRadio: Story = {
  render: (args) => {
    const [value, setValue] = useState("Option 2")
    return (
      <ToggleableInput {...args} displayNode={value} label="Preference">
        <Radio onChange={setValue} options={["Option 1", "Option 2", "Option 3"]} value={value} />
      </ToggleableInput>
    )
  },
}

export const WithMultiSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState(["Computer Science", "Mathematics"])
    return (
      <ToggleableInput {...args} displayNode={value.join(", ")} label="Majors">
        <MultiSelect
          onChange={setValue}
          options={["Computer Science", "Engineering", "Mathematics", "Physics"]}
          value={value}
        />
      </ToggleableInput>
    )
  },
}

export const Locked: Story = {
  render: (args) => (
    <ToggleableInput
      {...args}
      displayNode="john@university.ac.nz"
      label="Email"
      locked
      lockedReason="Email is used for login and cannot be changed here"
    >
      <Input onChange={() => {}} type="email" value="john@university.ac.nz" />
    </ToggleableInput>
  ),
}
