"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { projectFormOptions } from "@/features/project/editor/projectForm.options"
import { TEXT_BLOCK_MAX_CHARACTERS } from "@/features/project/project.constants"
import { withForm } from "@/lib/form/useAppForm"

export const TextBlockEditor = withForm({
  ...projectFormOptions,
  props: { index: 0 },
  render: function Render({ form, index }) {
    const name = `pageContent[${index}].content` as const

    // TanStack clears a field's errors on unmount, so a closed block would lose its save error.
    // This layout cleanup runs before the field's, and the passive cleanup after it.
    const saveError = useRef<unknown>(undefined)
    useLayoutEffect(
      () => () => {
        saveError.current = form.getFieldMeta(name)?.errorMap.onServer
      },
      [form, name],
    )
    useEffect(
      () => () => {
        const error = saveError.current
        if (!error) return
        form.setFieldMeta(name, (meta) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onServer: error },
          errorSourceMap: { ...meta.errorSourceMap, onServer: "form" },
        }))
      },
      [form, name],
    )

    return (
      <form.AppField name={name}>
        {(field) => (
          <field.RichTextField
            autoFocus
            hideLabel
            label={`Text section ${index + 1}`}
            maxCharacters={TEXT_BLOCK_MAX_CHARACTERS}
            placeholder="Write about your project"
          />
        )}
      </form.AppField>
    )
  },
})
