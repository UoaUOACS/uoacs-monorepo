import { tv, type VariantProps } from "tailwind-variants"

/**
 * Heading component variants for different heading levels.
 */
export const headingVariants = tv({
  slots: {
    textVariant: "flex flex-row flex-wrap items-end justify-center gap-x-[0.2em] text-center",
    periodVariant: "inline-block bg-primary",
  },
  variants: {
    h: {
      1: {
        textVariant: "heading-1",
        periodVariant: "ml-1.5 size-2 rounded-xs md:ml-3 md:size-3",
      },
      2: {
        textVariant: "heading-2",
        periodVariant: "ml-1 size-1.5 rounded-xs md:ml-2.5 md:size-2.5",
      },
      3: {
        textVariant: "heading-3",
        periodVariant: "ml-1 size-1.5 rounded-xs md:ml-2 md:size-2",
      },
      4: {
        textVariant: "heading-4",
        periodVariant: "ml-0.5 size-1 rounded-xs md:ml-1.5 md:size-1.5",
      },
    },
  },
  defaultVariants: {
    h: 1,
  },
})

export type HeadingVariants = VariantProps<typeof headingVariants>
