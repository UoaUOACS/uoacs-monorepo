import { Skeleton, tabsVariants } from "@uoacs/ui"
import { PROJECT_TABS } from "@/features/project/project.constants"

/**
 * A loading placeholder with the same layout as {@link ProjectTabs}. Each bar sits in a box with
 * the tab's classes and is about as wide as its label, so the row has the same height and wraps
 * about the same way.
 */
export const ProjectTabsSkeleton = ({ className }: { className?: string }) => {
  const { list, tab } = tabsVariants()

  return (
    <div aria-hidden="true" className={className}>
      <ul className={list()}>
        {PROJECT_TABS.map(({ value, label }) => (
          <li key={value}>
            <span className={tab()}>
              <Skeleton
                className="inline-block align-middle"
                shape="text"
                style={{ width: `${label.length}ch` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
