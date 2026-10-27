import type { Where } from "payload"
import { ProjectSort, ProjectTab } from "./types/enums"

/**
 * How many projects to show per page of the Discover section.
 */
export const PROJECTS_PER_PAGE = 9

/**
 * Author name shown on a project card when the project's author can't be loaded.
 */
export const UNKNOWN_AUTHOR_NAME = "Unknown author"

export const DEFAULT_PROJECT_SORT = ProjectSort.RECENT

/**
 * Sort options in the order they appear in the sort dropdown, mapped to Payload's `sort` syntax.
 */
export const PROJECT_SORT_OPTIONS: Record<ProjectSort, { label: string; payloadSort: string }> = {
  [ProjectSort.RECENT]: { label: "Recent", payloadSort: "-createdAt" },
  [ProjectSort.A_TO_Z]: { label: "A-Z", payloadSort: "name" },
  [ProjectSort.Z_TO_A]: { label: "Z-A", payloadSort: "-name" },
}

export const DEFAULT_PROJECT_TAB = ProjectTab.DISCOVER

export interface ProjectTabOption {
  value: ProjectTab
  label: string
  /**
   * Disabled tabs are shown as "coming soon" and can't be selected, even from the URL.
   */
  enabled: boolean
  /**
   * The Payload filter for projects in this tab. Omit to show every project.
   */
  where?: Where
}

/**
 * Tabs in the order they appear. To enable a tab once its data exists, set `enabled` and add a
 * `where` filter, e.g. `{ featured: { equals: true } }`.
 */
export const PROJECT_TABS: ProjectTabOption[] = [
  { value: ProjectTab.DISCOVER, label: "Discover", enabled: true },
  { value: ProjectTab.FEATURED, label: "Featured", enabled: false },
  { value: ProjectTab.HACKATHON, label: "Hackathon", enabled: false },
  { value: ProjectTab.AWARDS, label: "Awards", enabled: false },
  { value: ProjectTab.STAFF_PICKS, label: "Staff-picks", enabled: false },
]

export const PROJECT_TITLE_MAX_LENGTH = 40

export const PROJECT_SUMMARY_MAX_LENGTH = 200

/**
 * Most blocks a project page can have.
 */
export const PROJECT_MAX_BLOCKS = 50

export const IMAGE_GRID_MAX_IMAGES = 12

/**
 * Most characters in an image grid image's title, which is also its alt text
 */
export const IMAGE_TITLE_MAX_LENGTH = 120

/**
 * Most characters of text in one text block, not counting formatting.
 */
export const TEXT_BLOCK_MAX_CHARACTERS = 2000

/**
 * Largest image a member can upload. Under the 5MB server action body limit, which also counts the
 * multipart overhead.
 */
export const MEDIA_MAX_BYTES = 4 * 1024 * 1024

export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

/**
 * Smallest short side, in px, of an image a member can upload
 */
export const MEDIA_MIN_DIMENSION = 320

/**
 * Largest long side divided by short side of an image a member can upload
 */
export const MEDIA_MAX_ASPECT_RATIO = 3

/**
 * Longest side, in px, that the editor scales an image down to before it uploads it
 */
export const MEDIA_UPLOAD_MAX_DIMENSION = 2400
