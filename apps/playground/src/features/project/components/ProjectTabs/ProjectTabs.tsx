import Link from "next/link"
import { getDiscoverHref } from "@/features/project/helpers/discover"
import { PROJECT_TABS } from "@/features/project/project.constants"
import type { ProjectSort, ProjectTab } from "@/features/project/types/enums"
import { projectTabsVariants } from "./ProjectTabs.variants"

interface ProjectTabsProps {
  activeTab: ProjectTab
  /**
   * The current sort, kept when switching tabs.
   */
  sort: ProjectSort
  className?: string
}

/**
 * The row of tabs that filter the Discover section. Tabs that aren't enabled in
 * {@link PROJECT_TABS} are shown as "coming soon".
 */
export const ProjectTabs = ({ activeTab, sort, className }: ProjectTabsProps) => {
  const { list, tab } = projectTabsVariants()

  return (
    <nav aria-label="Project categories" className={className}>
      <ul className={list()}>
        {PROJECT_TABS.map(({ value, label, enabled }) => (
          <li key={value}>
            {enabled ? (
              <Link
                aria-current={value === activeTab ? "page" : undefined}
                className={tab({ active: value === activeTab })}
                href={getDiscoverHref({ tab: value, sort })}
                // Tab data is cached, so a full prefetch is cheap and skips the grid skeleton
                prefetch={value !== activeTab || undefined}
              >
                {label}
              </Link>
            ) : (
              <span aria-disabled="true" className={tab({ disabled: true })} title="Coming soon">
                {label}
                <span className="sr-only"> (coming soon)</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
