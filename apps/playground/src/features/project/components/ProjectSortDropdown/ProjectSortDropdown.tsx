import { Dropdown } from "@uoacs/ui"
import { PROJECT_SORT_OPTIONS } from "@/features/project/project.constants"
import { ProjectSort } from "@/features/project/types/enums"

interface ProjectSortDropdownProps {
  sort: ProjectSort
  /**
   * Builds the link for a sort, so the dropdown can keep whatever else is in the page's URL.
   */
  getSortHref: (sort: ProjectSort) => string
}

/**
 * The sort menu for a list of projects. Each option links to the first page of the new sort.
 */
export const ProjectSortDropdown = ({ sort, getSortHref }: ProjectSortDropdownProps) => (
  <Dropdown
    label={
      <span className="whitespace-nowrap">
        <span className="sr-only">Sort by </span>
        {PROJECT_SORT_OPTIONS[sort].label}
      </span>
    }
    options={Object.values(ProjectSort).map((value) => ({
      label: PROJECT_SORT_OPTIONS[value].label,
      href: getSortHref(value),
      theme: "ghost" as const,
      className: "w-full",
    }))}
    popoverClassName="items-stretch gap-0 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
    theme="ghost"
    trigger={{
      triggerClassName: "rounded-lg border border-gray-300 font-cartograph text-sm",
    }}
  />
)
