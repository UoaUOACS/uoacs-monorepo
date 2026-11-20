import { tv, type VariantProps } from "tailwind-variants"

export const editProfileTab = tv({
  base: "text-left text-sm transition-colors",
  variants: {
    active: {
      true: "font-bold text-black",
      false: "text-neutral-700 hover:text-black",
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type EditProfileTabVariants = VariantProps<typeof editProfileTab>
