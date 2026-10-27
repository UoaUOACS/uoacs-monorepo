type LexicalNode = { text?: unknown; children?: unknown }

/**
 * Counts the characters of text in saved rich text, not counting formatting or line breaks
 *
 * Safe for any input: skips nodes that are not objects, and loops rather than recurses so deep
 * nesting cannot overflow the stack. Has no imports, so client code can use it.
 */
export const countRichTextCharacters = (value: object): number => {
  let total = 0
  const stack: unknown[] = ["root" in value ? value.root : undefined]
  while (stack.length > 0) {
    const node = stack.pop()
    if (typeof node !== "object" || node === null) continue
    const { text, children } = node as LexicalNode
    if (typeof text === "string") total += text.length
    if (Array.isArray(children)) for (const child of children) stack.push(child)
  }
  return total
}
