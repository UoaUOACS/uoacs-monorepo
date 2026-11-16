import { tv, type VariantProps } from "tailwind-variants"

/**
 * Pagination variant configurations.
 * Consists of a current variant highlighting the active page, and a disabled variant for the
 * previous/next arrows at either end.
 */
export const paginationVariants = tv({
  slots: {
    root: "font-cartograph text-base text-black",
    list: "flex items-center gap-2",
    pages: "flex items-center gap-0.5",
    item: "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 whitespace-nowrap transition-colors duration-150 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800",
    ellipsis: "flex h-8 min-w-8 items-center justify-center text-2xs select-none",
    arrow:
      "flex size-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800",
    arrowIcon: "size-6 stroke-2",
  },
  variants: {
    current: {
      true: { item: "cursor-default bg-gray-800 text-white hover:bg-gray-800" },
      false: { item: "cursor-pointer" },
    },
    disabled: {
      true: { arrow: "pointer-events-none opacity-30" },
      false: { arrow: "cursor-pointer" },
    },
  },
  defaultVariants: { current: false, disabled: false },
})

/**
 * Props for the Pagination variant configuration.
 */
export type PaginationVariantProps = VariantProps<typeof paginationVariants>
