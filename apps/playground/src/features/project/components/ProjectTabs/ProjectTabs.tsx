import { Tabs } from "@uoacs/ui"
import { getDiscoverHref } from "@/features/project/helpers/discover"
import { PROJECT_TABS } from "@/features/project/project.constants"
import type { ProjectSort, ProjectTab } from "@/features/project/types/enums"

const TAB_OPTIONS = PROJECT_TABS.map(({ value, label, enabled }) => ({
  value,
  label,
  disabledReason: enabled ? undefined : "Coming soon",
}))

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
export const ProjectTabs = ({ activeTab, sort, className }: ProjectTabsProps) => (
  <Tabs
    activeTab={activeTab}
    aria-label="Project categories"
    className={className}
    getHref={(tab) => getDiscoverHref({ tab, sort })}
    // Tab data is cached, so a full prefetch is cheap and skips the grid skeleton
    prefetchTabs
    tabs={TAB_OPTIONS}
  />
)
