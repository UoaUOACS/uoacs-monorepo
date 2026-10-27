"use client"

import { useDebouncer } from "@tanstack/react-pacer"
import { countRichTextCharacters } from "@uoacs/shared"
import type { RichTextValue } from "@uoacs/shared/payload"
import type { RichTextEditorProps } from "@uoacs/ui/rich-text-editor"
import { cn } from "@uoacs/ui/utils"
import { Component, lazy, type ReactNode, useId, useState } from "react"
import { useFlushOnSubmit } from "../flush"
import { getFieldError, useFieldContext } from "../formContext"

// Lexical loads only when a rich text field first renders. Lazy, not next/dynamic, so the field
// suspends to a boundary above it, and a transition can keep the old UI while it loads.
const RichTextEditor = lazy(() =>
  import("@uoacs/ui/rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })),
)

/**
 * Starts loading the editor early, e.g. on hover or focus of a block that will show it
 */
export const preloadRichTextEditor = () => {
  // The editor's own load shows the error
  import("@uoacs/ui/rich-text-editor").catch(() => {})
}

// Catches a failed load of the editor code, e.g. offline, so the rest of the page keeps working
class EditorLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("[RichTextField] the editor failed to load", { error })
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="text-red-600 text-sm" role="alert">
          The editor could not load. Reload the page to try again.
        </p>
      )
    }
    return this.props.children
  }
}

export interface RichTextFieldProps
  extends Pick<RichTextEditorProps, "autoFocus" | "className" | "disabled" | "placeholder"> {
  label: string
  /**
   * Keeps the label for screen readers only
   */
  hideLabel?: boolean
  /**
   * Shows a live character count against this limit. Formatting does not count.
   */
  maxCharacters?: number
  /**
   * How long to wait after a keystroke before writing the value to the form
   */
  wait?: number
}

/**
 * The editor is uncontrolled and reads the field value once.
 * Remount it with a new `key` to load other content.
 * It suspends while the editor code loads, so render it inside a `Suspense` boundary.
 */
export const RichTextField = ({
  label,
  hideLabel,
  maxCharacters,
  wait = 300,
  ...props
}: RichTextFieldProps) => {
  const field = useFieldContext<RichTextValue | null>()
  const id = useId()
  const error = getFieldError(field.state.meta.errors)
  // Counted on every keystroke, as the field value is debounced
  const [count, setCount] = useState(() =>
    field.state.value ? countRichTextCharacters(field.state.value) : 0,
  )

  // Serialising the Lexical state on every keystroke is slow on long pages. No flush on unmount,
  // as after a block removal it would write to the block that took its index.
  const debouncer = useDebouncer(field.handleChange, { wait })
  const flush = () => debouncer.flush()
  useFlushOnSubmit(field.form, flush)

  return (
    <div className="flex w-full flex-col gap-2">
      <span
        className={cn("block font-medium text-gray-700 text-sm", hideLabel && "sr-only")}
        id={`${id}-label`}
      >
        {label}
      </span>
      <EditorLoadBoundary>
        <RichTextEditor
          {...props}
          aria-describedby={
            [error && `${id}-error`, maxCharacters && `${id}-count`].filter(Boolean).join(" ") ||
            undefined
          }
          aria-invalid={error ? true : undefined}
          aria-labelledby={`${id}-label`}
          defaultValue={field.state.value}
          onBlur={() => {
            flush()
            field.handleBlur()
          }}
          onChange={(value) => {
            if (maxCharacters) setCount(value ? countRichTextCharacters(value) : 0)
            debouncer.maybeExecute(value)
          }}
        />
      </EditorLoadBoundary>
      {maxCharacters && (
        <p
          className={cn("text-sm", count > maxCharacters ? "text-red-600" : "text-gray-500")}
          id={`${id}-count`}
        >
          {count}/{maxCharacters}
        </p>
      )}
      {error && (
        <p className="text-red-600 text-sm" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
