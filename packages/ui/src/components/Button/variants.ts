import { tv, type VariantProps } from "tailwind-variants"

/**
 * Button variant configurations.
 * Consists of themes, sizes, shapes, and font options.
 */
export const buttonVariants = tv({
  base: "button flex w-fit cursor-pointer flex-row items-center justify-center gap-2 transition-colors duration-300 ease-in-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:brightness-70",
  variants: {
    theme: {
      primary: "bg-primary text-white hover:bg-pink-400",
      ghost: "bg-transparent text-black hover:bg-gray-200",
      dark: "bg-black text-white hover:bg-gray-700",
      light: "bg-gray-300 text-black hover:bg-gray-400",
      "dark-primary": "bg-black text-white hover:bg-primary",
      "primary-dark": "bg-primary text-white hover:bg-black",
    },
    size: {
      sm: "h-6.5 px-3 py-1 md:h-8.5",
      md: "h-10 px-5 py-2 text-xl",
      lg: "h-16.75 px-7.5 text-xl",
      icon: "size-10 p-2",
      "icon-lg": "size-16.75 p-4",
    },
    shape: {
      default: "rounded-sm",
      rounded: "rounded-2lg",
      pill: "rounded-full",
    },
    font: {
      default: "font-medium",
      cartograph: "font-cartograph font-bold",
    },
  },
  defaultVariants: {
    theme: "primary",
    size: "sm",
    shape: "default",
    font: "default",
  },
})

/**
 * Props for the button variant configuration.
 */
export type ButtonVariantProps = VariantProps<typeof buttonVariants>
