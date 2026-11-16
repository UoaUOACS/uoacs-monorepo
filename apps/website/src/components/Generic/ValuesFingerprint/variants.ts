import { tv, type VariantProps } from "tailwind-variants"

export const valuesFingerprintVariants = tv({
  slots: {
    svg: "relative",
    container: "relative",
    label: "absolute top-1/2 -translate-y-1/2 transform font-semibold",
  },
  variants: {
    colour: {
      pink: {
        svg: "fill-brand-pink",
      },
      orange: {
        svg: "fill-brand-orange",
      },
      purple: {
        svg: "fill-brand-purple",
      },
      blue: {
        svg: "fill-brand-blue",
      },
    },
    size: {
      sm: {
        svg: "size-32",
        label: "ml-7 text-5xl",
      },
      md: {
        svg: "size-38",
        label: "ml-8 text-6xl",
      },
      lg: {
        svg: "size-44",
        label: "ml-9 text-7xl",
      },
    },
  },
  defaultVariants: {
    colour: "purple",
    size: "md",
  },
})

export type ValuesFingerprintVariants = VariantProps<typeof valuesFingerprintVariants>
