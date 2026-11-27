import { Skeleton, tabsVariants } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { PROJECT_TABS } from "@/features/project/project.constants"

/**
 * A loading placeholder with the same layout as {@link ProjectTabs}. Each bar is an inline box
 * as wide as its tab's label, so the row has the same height and wraps the same way.
 */
export const ProjectTabsSkeleton = ({ className }: { className?: string }) => {
  const { list, tab } = tabsVariants()

  return (
    <div aria-hidden="true" className={className}>
      <ul className={list()}>
        {PROJECT_TABS.map(({ value, label }) => (
          <li key={value}>
            <Skeleton
              className={cn(tab(), "inline-block align-middle")}
              shape="text"
              style={{ width: `${label.length}ch` }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
