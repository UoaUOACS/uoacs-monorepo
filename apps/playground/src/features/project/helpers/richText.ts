import type { RichTextValue } from "@uoacs/shared/payload"

const getText = (node: object): string => {
  if ("text" in node && typeof node.text === "string") return node.text
  if (!("children" in node) || !Array.isArray(node.children)) return ""
  return node.children.map(getText).join("")
}

/**
 * The text of the first paragraph, heading or list item that has any, without formatting
 */
export const getFirstLineOfText = (value: RichTextValue | null): string => {
  for (const node of value?.root.children ?? []) {
    const text = getText(node).trim()
    if (text) return text
  }
  return ""
}
