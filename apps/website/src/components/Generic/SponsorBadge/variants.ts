import { tv, type VariantProps } from "tailwind-variants"

/**
 * Sponsor Badge variant configurations.
 * Consists of themes options.
 */
export const sponsorBadgeVariants = tv({
  slots: {
    inner:
      "paragraph flex w-fit flex-row items-center gap-4 border-4 border-transparent p-4 px-3 py-2 text-left font-mono",
    border:
      "w-fit cursor-pointer rounded-xs border-4 border-transparent focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  },
  variants: {
    tier: {
      gold: {
        inner: "bg-sponsor-gold",
        border: "border-orange-200-opaque",
      },
      silver: {
        inner: "bg-sponsor-silver",
        border: "border-gray-300-opaque",
      },
      diamond: {
        inner: "bg-sponsor-diamond",
        border: "border-blue-200-opaque",
      },
    },
  },
  defaultVariants: {
    tier: "gold",
  },
})

/**
 * Props for the button variant configuration.
 */
export type SponsorBadgeVariantProps = VariantProps<typeof sponsorBadgeVariants>
