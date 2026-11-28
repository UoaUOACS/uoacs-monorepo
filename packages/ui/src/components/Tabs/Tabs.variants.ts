import { tv, type VariantProps } from "tailwind-variants"

/**
 * Tabs variant configurations.
 * Consists of an active variant that highlights the current tab, and a disabled variant for tabs
 * that cannot be selected. The indicator is the bar under the active tab's label.
 */
export const tabsVariants = tv({
  slots: {
    list: "flex flex-wrap items-center justify-center gap-4",
    tab: "relative inline-block p-2 font-bold transition-colors duration-150",
    indicator: "absolute -inset-x-1 bottom-1 h-0.5 bg-primary",
  },
  variants: {
    active: {
      true: { tab: "text-primary" },
      false: { tab: "cursor-pointer text-gray-400 hover:text-gray-600" },
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
