"use client"

import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
} from "@lexical/markdown"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import type { RichTextValue } from "@uoacs/shared/payload"
import {
  $getRoot,
  createEditor,
  type EditorState,
  type EditorThemeClasses,
  type SerializedLexicalNode,
} from "lexical"
import { Component, type ReactNode, useEffect, useState } from "react"
import { cn } from "../../utils"
import { textAreaVariants } from "../TextArea/variants"
import { RICH_TEXT_NODES, SUPPORTED_NODE_TYPES } from "./nodes"
import { RichTextToolbar } from "./RichTextToolbar"

type SerializedNodeLike = SerializedLexicalNode & { children?: unknown }

const findUnsupportedTypes = (node: unknown, found = new Set<string>()) => {
  if (
    typeof node !== "object" ||
    node === null ||
    typeof (node as SerializedNodeLike).type !== "string"
  ) {
    found.add("invalid node")
    return found
  }
  const { children, type } = node as SerializedNodeLike
  if (!SUPPORTED_NODE_TYPES.has(type)) found.add(type)
  if (Array.isArray(children)) for (const child of children) findUnsupportedTypes(child, found)
  return found
}

// Parses the value the same way the editor will. In production Lexical only logs a parse
// error and loads the nodes it read before it, so the next save would delete the rest.
const parseError = (value: RichTextValue) => {
  const editor = createEditor({
    nodes: RICH_TEXT_NODES,
    onError: (error) => {
      throw error
    },
  })
  try {
    editor.parseEditorState(value)
    return null
  } catch (error) {
    return error
  }
}

// The editor does not mount for any of these, so a save cannot delete content it did not load.
const findLoadProblem = (value: RichTextValue) => {
  const root = value.root
  if (root?.type !== "root" || !Array.isArray(root.children)) return "it is not rich text"
  const unsupported = [...findUnsupportedTypes(root)]
  if (unsupported.length > 0) {
    return `it uses formatting the editor cannot edit (${unsupported.join(", ")})`
  }
  const error = parseError(value)
  if (error) {
    console.error("RichTextEditor: Lexical cannot parse defaultValue", error)
    return "the editor cannot read it"
  }
  return null
}

// Lexical cannot load a root with no children. It is the same as no content.
const isEmpty = (value: RichTextValue) =>
  Array.isArray(value.root?.children) && value.root.children.length === 0

// Text is what the rendered page shows, so a block with no text, such as an empty heading, is empty too.
const toValue = (state: EditorState) =>
  state.read(() => $getRoot().getTextContent().trim()) === ""
    ? null
    : (state.toJSON() as RichTextValue)

// Only the formats the toolbar offers. Their nodes must be in RICH_TEXT_NODES.
const TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
]

// Underline renders as a plain span, and bold with italic renders as one <strong>, so the text formats still need classes.
const theme: EditorThemeClasses = {
  text: { bold: "font-bold", italic: "italic", underline: "underline" },
}

export interface RichTextEditorProps {
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  "aria-labelledby"?: string
  /**
   * Focuses the editor when it mounts, e.g. when the user opens it to type
   */
  autoFocus?: boolean
  className?: string
  /**
   * Read once on mount, and later changes are ignored. The editor is uncontrolled, so to
   * load a different record, remount it with `key={record.id}`. `null` is an empty field.
   */
  defaultValue?: RichTextValue | null
  disabled?: boolean
  id?: string
  onBlur?: () => void
  onChange?: (value: RichTextValue | null) => void
  placeholder?: string
}

export const RichTextEditor = ({
  autoFocus = false,
  className,
  defaultValue,
  disabled = false,
  onBlur,
  onChange,
  placeholder = "",
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
}: RichTextEditorProps) => {
  const [{ initialValue, loadProblem }] = useState(() => {
    const value = defaultValue && !isEmpty(defaultValue) ? defaultValue : undefined
    const problem = value ? findLoadProblem(value) : null
    if (problem) console.error("RichTextEditor: defaultValue cannot be loaded", { id, problem })
    return { initialValue: value, loadProblem: problem }
  })

  if (loadProblem) {
    return (
      <EditorAlert className={className}>This content cannot be edited: {loadProblem}.</EditorAlert>
    )
  }

  return (
    <EditorErrorBoundary className={className}>
      <LexicalComposer
        initialConfig={{
          editable: !disabled,
          // LexicalComposer takes a JSON string or an EditorState, not a plain object.
          editorState: initialValue ? JSON.stringify(initialValue) : undefined,
          namespace: "RichTextEditor",
          nodes: RICH_TEXT_NODES,
          // Throwing skips Lexical's reset to the last good state, so production only logs.
          onError: (error) => {
            console.error("RichTextEditor:", error)
            if (process.env.NODE_ENV !== "production") throw error
          },
          theme,
        }}
      >
        <div className={cn("flex flex-col gap-2", className)} data-slot="rich-text-editor">
          <RichTextToolbar disabled={disabled} />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  aria-placeholder={placeholder}
                  ariaDescribedBy={ariaDescribedBy}
                  ariaInvalid={ariaInvalid}
                  ariaLabelledBy={ariaLabelledBy}
                  ariaMultiline
                  className={cn(
                    textAreaVariants({ resize: "none" }),
                    "rich-text min-h-40 rounded-xl bg-white",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                  id={id}
                  onBlur={onBlur}
                  placeholder={
                    <div className="pointer-events-none absolute top-2.25 left-3.25 text-gray-400 leading-relaxed">
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin ignoreSelectionChange onChange={(state) => onChange?.(toValue(state))} />
        <EditablePlugin editable={!disabled} />
        {autoFocus && <AutoFocusPlugin />}
      </LexicalComposer>
    </EditorErrorBoundary>
  )
}

const EditorAlert = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-red-600 text-sm", className)} role="alert">
    {children}
  </p>
)

// Catches errors thrown while the editor renders. findLoadProblem catches bad content first.
class EditorErrorBoundary extends Component<
  { children: ReactNode; className?: string },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("RichTextEditor: the editor failed", error)
  }

  render() {
    if (this.state.failed) {
      return (
        <EditorAlert className={this.props.className}>
          The editor could not load. Reload the page to try again.
        </EditorAlert>
      )
    }
    return this.props.children
  }
}

// `initialConfig` is read once, so later `disabled` changes are pushed into the editor here.
const EditablePlugin = ({ editable }: { editable: boolean }) => {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    editor.setEditable(editable)
  }, [editor, editable])
  return null
}
