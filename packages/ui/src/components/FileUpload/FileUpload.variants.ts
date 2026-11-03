import { tv, type VariantProps } from "tailwind-variants"

/**
 * FileUpload preview variant configurations.
 * Row lists each file on its own line. Card shows each file as a fixed-width tile that wraps.
 */
export const fileUploadPreviewVariants = tv({
  slots: {
    list: "",
    item: "rounded border border-gray-300",
    thumbnail: "shrink-0 rounded object-cover",
    icon: "shrink-0 text-gray-400",
    info: "flex min-w-0 flex-col",
    name: "truncate text-sm text-gray-700",
    size: "text-xs text-gray-400",
    remove: "rounded p-1 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed",
  },
  variants: {
    previewVariant: {
      row: {
        list: "flex flex-col gap-2",
        item: "flex items-center gap-3 px-3 py-2",
        thumbnail: "size-10",
        icon: "size-10",
        info: "flex-1",
      },
      card: {
        list: "flex flex-wrap gap-3",
        item: "relative flex w-32 flex-col gap-2 p-2",
        thumbnail: "aspect-square w-full",
        icon: "aspect-square w-full p-6",
        remove: "absolute top-3 right-3 bg-white/80 hover:bg-white",
      },
    },
  },
  defaultVariants: { previewVariant: "row" },
})

/**
 * Props for the FileUpload preview variant configuration.
 */
export type FileUploadPreviewVariantProps = VariantProps<typeof fileUploadPreviewVariants>
