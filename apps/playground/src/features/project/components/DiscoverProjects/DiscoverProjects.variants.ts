import { tv, type VariantProps } from "tailwind-variants"

export const discoverProjectsVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-8",
    header: "relative flex flex-col items-center gap-4 md:flex-row md:justify-center",
    sort: "self-end md:absolute md:right-0",
    heading: "border-b border-gray-200 pb-2 font-cartograph text-sm text-gray-400",
  },
})

export type DiscoverProjectsVariants = VariantProps<typeof discoverProjectsVariants>
