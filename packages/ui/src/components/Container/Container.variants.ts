import { tv, type VariantProps } from "tailwind-variants"

/**
 * Container variant configurations.
 * Consists of themes for brand colours and sponsor tier colours.
 */
export const containerVariants = tv({
  slots: {
    container: "relative w-fit rounded-lg border-4",
    title:
      "paragraph absolute top-0 left-1/2 max-w-full -translate-x-1/2 -translate-y-1/2 rounded-sm px-3 py-1 text-center font-semibold whitespace-nowrap",
  },
  variants: {
    theme: {
      primary: {
        container: "border-primary",
        title: "bg-primary text-white",
      },
      diamond: {
        container: "border-sponsor-diamond",
        title: "bg-sponsor-diamond text-black",
      },
      gold: {
        container: "border-sponsor-gold",
        title: "bg-sponsor-gold text-black",
      },
      silver: {
        container: "border-sponsor-silver",
        title: "bg-sponsor-silver text-black",
      },
    },
  },
  defaultVariants: {
    theme: "primary",
  },
})

/**
 * Props for the container variant configuration.
 */
export type ContainerVariantProps = VariantProps<typeof containerVariants>
