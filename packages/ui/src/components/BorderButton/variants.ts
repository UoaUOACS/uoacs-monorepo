import { tv, type VariantProps } from "tailwind-variants"

/**
 * Button variant configurations.
 * Consists of themes, sizes, and border options.
 */
export const borderButtonVariants = tv({
  slots: {
    inner:
      "flex flex-row items-center gap-4 rounded-xl border-4 border-transparent bg-black p-4 text-left font-mono text-white transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
    border:
      "cursor-pointer rounded-2xl border-4 border-transparent transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  },
  variants: {
    theme: {
      primary: {
        inner: "bg-primary text-white hover:bg-pink-400",
        border: "border-primary-opaque",
      },
      ghost: {
        inner: "bg-transparent text-black hover:bg-gray-200",
        border: "border-gray-900-opaque",
      },
      dark: {
        inner: "bg-black text-white hover:bg-gray-700",
        border: "border-gray-300",
      },
      light: {
        inner: "bg-gray-300 text-black hover:bg-gray-400",
        border: "border-gray-200",
      },
    },
    size: {
      navbar: {
        inner: "gap-2 px-6 py-3 text-sm",
      },
      sm: {
        inner: "gap-2 px-4 py-2 text-sm",
      },
      "sm-wide": {
        inner: "gap-2 px-6 py-2 text-sm",
      },
      md: {
        inner: "paragraph gap-4 p-4",
      },
      "md-wide": {
        inner: "paragraph gap-4 px-6 py-4",
      },
      lg: {
        inner: "gap-6 p-6 text-lg",
      },
      "lg-wide": {
        inner: "gap-6 px-10 py-6 text-lg",
      },
    },
    border: {
      true: {},
      false: {
        border: "border-transparent",
      },
      none: {
        border: "border-0",
        inner: "border-0",
      },
    },
  },
  defaultVariants: {
    theme: "primary",
    size: "md",
    border: true,
  },
})

/**
 * Props for the button variant configuration.
 */
export type BorderButtonVariantProps = VariantProps<typeof borderButtonVariants>
