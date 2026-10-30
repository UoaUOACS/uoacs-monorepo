import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { RichTextValue } from "@uoacs/shared/payload"
import { Suspense, useState } from "react"
import { fn } from "storybook/test"
import { submitForm } from "./flush"
import { useAppForm } from "./useAppForm"

const upload = async (formData: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const file = formData.get("file")
  return {
    ok: true as const,
    id: "000000000000000000000002",
    url: file instanceof File ? URL.createObjectURL(file) : null,
  }
}

interface ExampleFormProps {
  onSubmit: (value: unknown) => void
}

// Stands in for the server: refuses an empty title, like `saveProject` does
const ExampleForm = ({ onSubmit }: ExampleFormProps) => {
  const [submitted, setSubmitted] = useState<unknown>()
  const form = useAppForm({
    defaultValues: {
      name: "",
      summary: "",
      coverImage: null as string | null,
      content: null as RichTextValue | null,
    },
    validators: {
      onSubmitAsync: async ({ value }) =>
        value.name.trim() ? undefined : { fields: { name: "Add a title" } },
    },
    onSubmit: ({ value }) => {
      setSubmitted(value)
      onSubmit(value)
    },
  })

  return (
    <form
      className="flex w-120 flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void submitForm(form)
      }}
    >
      <form.AppField name="name">{(field) => <field.TextField label="Title" />}</form.AppField>
      <form.AppField name="summary">
        {(field) => <field.TextAreaField label="Summary" maxLength={200} />}
      </form.AppField>
      <form.AppField name="coverImage">
        {(field) => (
          <field.ImageUploadField
            label="Cover image"
            maxBytes={4 * 1024 * 1024}
            maxDimension={2400}
            types={["image/jpeg", "image/png", "image/webp", "image/avif"]}
            upload={upload}
          />
        )}
      </form.AppField>
      <form.AppField name="content">
        {(field) => (
          <Suspense>
            <field.RichTextField label="Content" placeholder="Write something…" />
          </Suspense>
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Save</form.SubmitButton>
      </form.AppForm>
      {submitted !== undefined && (
        <pre className="overflow-auto text-xs" data-testid="submitted">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </form>
  )
}

const meta: Meta<typeof ExampleForm> = {
  title: "Form/Fields",
  component: ExampleForm,
  args: { onSubmit: fn() },
}

export default meta
type Story = StoryObj<typeof ExampleForm>

/**
 * Submit with an empty title to see a server error. Type in the editor and submit at once to
 * check that the last keystrokes reach `onSubmit`.
 */
export const Default: Story = {}
