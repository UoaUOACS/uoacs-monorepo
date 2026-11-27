import { tv, type VariantProps } from "tailwind-variants"

/**
 * Tabs variant configurations.
 * Consists of an active variant highlighting the current tab, and a disabled variant for tabs
 * that can't be selected yet.
 */
export const tabsVariants = tv({
  slots: {
    list: "flex flex-wrap items-center justify-center gap-x-10 gap-y-2",
    tab: "font-cartograph text-sm transition-colors duration-150",
  },
  variants: {
    active: {
      true: { tab: "text-black" },
      false: { tab: "cursor-pointer text-gray-400 hover:text-gray-700" },
    },
    disabled: {
      true: { tab: "cursor-not-allowed text-gray-300 hover:text-gray-300" },
    },
  },
  defaultVariants: {
    active: false,
  },
})

/**
 * Props for the Tabs variant configuration.
 */
export type TabsVariantProps = VariantProps<typeof tabsVariants>
