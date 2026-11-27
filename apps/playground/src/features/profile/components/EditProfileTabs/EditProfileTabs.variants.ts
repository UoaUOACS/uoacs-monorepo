import { tv, type VariantProps } from "tailwind-variants"

export const editProfileTab = tv({
  base: "text-md text-left transition-colors",
  variants: {
    active: {
      true: "cursor-pointer font-bold text-black",
      false: "cursor-pointer text-neutral-700 hover:text-black",
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type EditProfileTabVariants = VariantProps<typeof editProfileTab>
