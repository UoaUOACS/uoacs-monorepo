import { tv, type VariantProps } from "tailwind-variants"

/**
 * Variants for the MobileNavbar component.
 */
export const mobileNavbarVariants = tv({
  base: "overscroll-y-hidden fixed top-0 left-0 z-50 flex h-dvh w-full touch-pan-y flex-col items-center justify-start gap-16 bg-white pt-6 md:hidden",
  variants: {
    isOpen: {
      true: "flex",
      false: "hidden",
    },
  },
})

export type MobileNavbarVariants = VariantProps<typeof mobileNavbarVariants>
