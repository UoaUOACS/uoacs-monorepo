import { Skeleton } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { projectCardVariants } from "@/features/project/components/ProjectCard/ProjectCard.variants"

const { base, content } = projectCardVariants({ variant: "profile" })

interface ProjectEditorSkeletonProps {
  /**
   * Whether the project is not saved yet, so the toolbar has no menu
   */
  create?: boolean
}

/**
 * A label, its character count and its input, as in the editor's text fields
 */
const FieldSkeleton = ({
  labelClassName,
  inputClassName,
}: {
  labelClassName: string
  inputClassName: string
}) => (
  <div className="flex flex-col gap-2">
    <Skeleton className={cn("h-5", labelClassName)} />
    <Skeleton className="-mt-1 h-3 w-10 md:h-4.25" />
    <Skeleton className={cn("w-full", inputClassName)} />
  </div>
)

/**
 * A loading placeholder with the same layout as `ProjectEditor`
 */
export const ProjectEditorSkeleton = ({ create }: ProjectEditorSkeletonProps) => (
  <div aria-hidden="true" className="flex w-full flex-col gap-4">
    <div className="flex items-center justify-end gap-1 py-3 sm:gap-4">
      <Skeleton className="h-6.5 w-19 sm:w-21 md:h-8.5" />
      <Skeleton className="h-6.5 w-19 sm:w-37 md:h-8.5" />
      <Skeleton className="h-6.5 w-19 sm:w-33 md:h-8.5" />
      {!create && <Skeleton className="size-8 rounded-full sm:size-10" />}
    </div>
    <div className="flex flex-col gap-12 md:gap-15">
      <div className={base({ className: "border border-gray-200" })}>
        <Skeleton className="aspect-4/3 h-auto w-full rounded-2xl md:w-64 md:shrink-0 md:self-start lg:w-100" />
        <div className={content({ className: "md:justify-center" })}>
          <FieldSkeleton inputClassName="h-9.25 md:h-10.5" labelClassName="w-14" />
          <FieldSkeleton inputClassName="h-16" labelClassName="w-18" />
        </div>
      </div>
      <Skeleton className="min-h-80 w-full" />
    </div>
  </div>
)
