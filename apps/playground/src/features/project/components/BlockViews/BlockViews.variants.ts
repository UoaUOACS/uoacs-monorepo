import { tv } from "tailwind-variants"

/**
 * The fixed-height row a block shows as in the editor's reorder mode.
 */
export const compactBlockVariants = tv({
  slots: {
    base: "flex h-16 w-full min-w-0 items-center gap-4 rounded-xl border border-gray-200 bg-white px-4",
    content: "flex min-w-0 grow items-center gap-2 truncate text-gray-900 text-sm",
    thumbnail: "relative size-10 shrink-0 overflow-hidden rounded-md bg-gray-100",
  },
})
