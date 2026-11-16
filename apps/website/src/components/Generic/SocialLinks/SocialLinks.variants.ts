import { tv, type VariantProps } from "tailwind-variants"

export const socialLinksVariants = tv({
  slots: {
    container: "flex w-fit items-start",
    icon: "",
  },
  variants: {
    variant: {
      hero: {
        container:
          "flex-wrap justify-center gap-2 self-center md:flex-nowrap md:gap-4 md:self-start",
        icon: "h-6 w-6 md:h-7 md:w-7",
      },
      footer: {
        container: "flex-row gap-4",
        icon: "h-5 w-5",
      },
    },
  },
  defaultVariants: {
    variant: "hero",
  },
})

export type SocialLinksVariantProps = VariantProps<typeof socialLinksVariants>
