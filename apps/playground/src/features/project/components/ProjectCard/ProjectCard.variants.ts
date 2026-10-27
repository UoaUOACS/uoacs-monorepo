import { tv, type VariantProps } from "tailwind-variants"

export const projectCardVariants = tv({
  slots: {
    base: "group relative flex w-full max-w-sm flex-col transition-all duration-200",
    imageWrapper: "relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-100",
    overlay:
      "pointer-events-none absolute inset-x-0 bottom-0 flex h-2/5 items-end bg-linear-to-t from-black/70 via-black/25 via-50% to-transparent p-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-has-focus-visible:opacity-100 pointer-coarse:opacity-100",
    title: "font-cartograph text-lg text-white",
    footer: "flex min-w-0 items-center justify-between px-2 py-3",
    authorGroup: "flex min-w-0 items-center gap-2",
    avatarIcon: "shrink-0 stroke-2 text-gray-900",
    authorName: "font-neulis truncate text-sm font-semibold text-gray-900",
    statsGroup: "flex shrink-0 items-center gap-3",
    awardIcon: "shrink-0 stroke-2 text-gray-900",
    likesGroup: "flex items-center gap-1",
    heartIcon: "shrink-0 stroke-2 text-gray-900",
    likesCount: "text-xs font-medium text-gray-500",
    content: "",
    textGroup: "",
    description: "",
    awardGroup: "",
    awardTitle: "",
    awardSubtitle: "",
  },
  variants: {
    variant: {
      default: {},
      profile: {
        base: "max-w-none gap-6 rounded-md bg-white p-4 md:flex-row md:gap-10 md:p-8",
        imageWrapper: "md:w-64 md:shrink-0 md:self-start lg:w-100",
        title: "font-switzer text-3xl font-bold break-words text-gray-900",
        heartIcon: "size-5",
        likesCount: "text-sm font-normal text-gray-500",
        content: "flex min-w-0 flex-1 flex-col gap-4",
        textGroup: "flex flex-col md:flex-1 md:justify-center",
        description: "paragraph mt-2 line-clamp-3 text-gray-900",
        awardIcon: "size-8",
        awardGroup: "flex items-start gap-2 md:self-end",
        awardTitle: "paragraph font-semibold text-gray-900",
        awardSubtitle: "paragraph-sm text-gray-400",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type ProjectCardVariants = VariantProps<typeof projectCardVariants>
