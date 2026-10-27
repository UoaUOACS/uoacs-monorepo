"use client"

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BoldIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
  UnderlineIcon,
} from "@heroicons/react/24/outline"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  type ListType,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text"
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection"
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils"
import {
  $createParagraphNode,
  $findMatchingParent,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  type ElementNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical"
import { type ComponentType, type ReactNode, type SVGProps, useEffect, useState } from "react"
import { cn } from "../../utils"
import { Button } from "../Button/Button"
import { Dropdown } from "../Dropdown/Dropdown"
import { FONTS } from "./fonts"

const TEXT_STYLES = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
] as const

type TextStyle = (typeof TEXT_STYLES)[number]["value"]

type BlockType = TextStyle | "quote" | ListType

const ALIGNMENTS = [
  { icon: Bars3BottomLeftIcon, label: "Align left", value: "left" },
  { icon: Bars3Icon, label: "Align center", value: "center" },
  { icon: Bars3BottomRightIcon, label: "Align right", value: "right" },
] as const

type Alignment = (typeof ALIGNMENTS)[number]["value"]

type ToolbarState = {
  alignment: Alignment
  blockType: BlockType
  canRedo: boolean
  canUndo: boolean
  /** `""` is no font, and `null` is more than one font. */
  fontFamily: string | null
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
}

const NO_FONT = "inherit"

const initialState: ToolbarState = {
  alignment: "left",
  blockType: "paragraph",
  canRedo: false,
  canUndo: false,
  fontFamily: "",
  isBold: false,
  isItalic: false,
  isUnderline: false,
}

function useToolbarState() {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState(initialState)

  useEffect(() => {
    // Runs inside a read or update, so the $ helpers have an active editor state.
    const readSelection = () => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchor = selection.anchor.getNode()
      const block = $findMatchingParent(
        anchor,
        (node) => $isElementNode(node) && !node.isInline() && $isRootNode(node.getParent()),
      )
      // Alignment is set on the nearest block, which is the list item inside a list.
      const alignBlock = $findMatchingParent(
        anchor,
        (node) => $isElementNode(node) && !node.isInline(),
      )
      const list = $getNearestNodeOfType(anchor, ListNode)

      let blockType: BlockType = "paragraph"
      if (list) blockType = list.getListType()
      else if ($isHeadingNode(block)) blockType = block.getTag()
      else if ($isQuoteNode(block)) blockType = "quote"

      const format = $isElementNode(alignBlock) ? alignBlock.getFormatType() : ""
      const alignment: Alignment = format === "center" || format === "right" ? format : "left"

      // Lexical gives "" for more than one font, so text with no font needs a different default.
      const font = $getSelectionStyleValueForProperty(selection, "font-family", NO_FONT)

      // Read everything here: React runs the updater later, outside the editor state.
      const next = {
        alignment,
        blockType,
        fontFamily: font === "" ? null : font === NO_FONT ? "" : font,
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
      }
      setState((prev) => ({ ...prev, ...next }))
    }

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => editorState.read(readSelection)),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          readSelection()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (canUndo) => {
          setState((prev) => ({ ...prev, canUndo }))
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (canRedo) => {
          setState((prev) => ({ ...prev, canRedo }))
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return state
}

export const RichTextToolbar = ({ disabled }: { disabled: boolean }) => {
  const [editor] = useLexicalComposerContext()
  const state = useToolbarState()

  // Clicking the active block type turns it back into a paragraph.
  const setBlock = (type: BlockType, create: () => ElementNode) =>
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const next: () => ElementNode = state.blockType === type ? $createParagraphNode : create
      $setBlocksType(selection, next)
    })

  const setTextStyle = (style: TextStyle) => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      $setBlocksType(selection, () =>
        style === "paragraph" ? $createParagraphNode() : $createHeadingNode(style),
      )
    })
    editor.focus()
  }

  const setFont = (fontFamily: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      $patchStyleText(selection, { "font-family": fontFamily || null })
    })
    editor.focus()
  }

  const toggleList = (type: Exclude<ListType, "check">) => {
    if (state.blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      const command =
        type === "bullet" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND
      editor.dispatchCommand(command, undefined)
    }
  }

  // Blocks with no text style, such as quotes and lists, show the placeholder.
  const textStyleLabel =
    TEXT_STYLES.find((style) => style.value === state.blockType)?.label ?? "Text style"

  // More than one font matches no option, so it shows the placeholder.
  const fontLabel = FONTS.find((font) => font.value === state.fontFamily)?.label ?? "Font"

  return (
    <div
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-300 bg-white px-4 py-2"
      data-slot="rich-text-toolbar"
      role="toolbar"
    >
      <ToolbarGroup label="Font">
        <Dropdown
          disabled={disabled}
          fast
          keepFocus
          label={<span className="w-16 text-left">{fontLabel}</span>}
          options={FONTS.map((font) => ({
            label: font.label,
            onClick: () => setFont(font.value),
            theme: font.value === state.fontFamily ? "primary" : "ghost",
          }))}
          popoverClassName="right-auto left-0 z-30 items-stretch gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-md"
          theme="ghost"
          trigger={{
            triggerClassName: "font-semibold text-sm disabled:opacity-50",
            triggerIcon: <ChevronDownIcon aria-hidden="true" className="h-4 w-4" />,
          }}
        />
      </ToolbarGroup>
      <ToolbarGroup label="Block type">
        <Dropdown
          disabled={disabled}
          fast
          keepFocus
          label={<span className="w-20 text-left">{textStyleLabel}</span>}
          options={TEXT_STYLES.map((style) => ({
            label: style.label,
            onClick: () => setTextStyle(style.value),
            theme: style.value === state.blockType ? "primary" : "ghost",
          }))}
          popoverClassName="right-auto left-0 z-30 items-stretch gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-md"
          theme="ghost"
          trigger={{
            triggerClassName: "font-semibold text-sm disabled:opacity-50",
            triggerIcon: <ChevronDownIcon aria-hidden="true" className="h-4 w-4" />,
          }}
        />
      </ToolbarGroup>
      <ToolbarGroup label="Text format">
        <ToolbarButton
          disabled={disabled}
          icon={BoldIcon}
          label="Bold"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          pressed={state.isBold}
        />
        <ToolbarButton
          disabled={disabled}
          icon={ItalicIcon}
          label="Italic"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          pressed={state.isItalic}
        />
        <ToolbarButton
          disabled={disabled}
          icon={UnderlineIcon}
          label="Underline"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          pressed={state.isUnderline}
        />
      </ToolbarGroup>
      <ToolbarGroup label="Alignment">
        {ALIGNMENTS.map(({ icon, label, value }) => (
          <ToolbarButton
            disabled={disabled}
            icon={icon}
            key={value}
            label={label}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value)}
            pressed={state.alignment === value}
          />
        ))}
      </ToolbarGroup>
      <ToolbarGroup label="Blocks">
        <ToolbarButton
          disabled={disabled}
          icon={ChatBubbleBottomCenterTextIcon}
          label="Quote"
          onClick={() => setBlock("quote", $createQuoteNode)}
          pressed={state.blockType === "quote"}
        />
        <ToolbarButton
          disabled={disabled}
          icon={ListBulletIcon}
          label="Bulleted list"
          onClick={() => toggleList("bullet")}
          pressed={state.blockType === "bullet"}
        />
        <ToolbarButton
          disabled={disabled}
          icon={NumberedListIcon}
          label="Numbered list"
          onClick={() => toggleList("number")}
          pressed={state.blockType === "number"}
        />
      </ToolbarGroup>
      <ToolbarGroup className="ml-auto" label="History">
        <ToolbarButton
          disabled={disabled || !state.canUndo}
          icon={ArrowUturnLeftIcon}
          label="Undo"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        />
        <ToolbarButton
          disabled={disabled || !state.canRedo}
          icon={ArrowUturnRightIcon}
          label="Redo"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        />
      </ToolbarGroup>
    </div>
  )
}

const ToolbarGroup = ({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) => (
  // biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls, not toolbar groups
  <div aria-label={label} className={cn("flex items-center gap-2", className)} role="group">
    {children}
  </div>
)

const ToolbarButton = ({
  disabled,
  icon: Icon,
  label,
  onClick,
  pressed,
}: {
  disabled: boolean
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  onClick: () => void
  pressed?: boolean
}) => (
  <Button
    aria-label={label}
    aria-pressed={pressed}
    className="h-9 px-1.5 disabled:opacity-50 aria-pressed:bg-pink-100 aria-pressed:text-pink-700 aria-pressed:hover:bg-pink-200 md:h-9"
    disabled={disabled}
    onClick={onClick}
    // Keep the editor's selection when a button is clicked.
    onMouseDown={(event) => event.preventDefault()}
    theme="ghost"
    title={label}
  >
    <Icon aria-hidden="true" className="h-6 w-6" />
  </Button>
)
