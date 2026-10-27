import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { Where } from "payload"
import { getCurrentMember } from "@/features/member/member.queries"
import type { Project as ProjectCardData } from "@/features/project/components/ProjectCard/ProjectCard"
import type { DiscoverState } from "@/features/project/helpers/discover"
import { toProjectCard } from "@/features/project/helpers/toProjectCard"
import {
  PROJECT_SORT_OPTIONS,
  PROJECT_TABS,
  PROJECTS_PER_PAGE,
} from "@/features/project/project.constants"
import { objectIDSchema } from "@/features/project/schemas/objectID.schema"
import type { ProjectSort } from "@/features/project/types/enums"
import { CacheTags } from "@/lib/cache"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import { getRelationID } from "@/lib/payload/getRelationID"
import type { Project } from "@/payload/payload-types"
import type { SearchState } from "../search/helpers/search"

export interface ProjectsPage {
  projects: ProjectCardData[]
  totalPages: number
}

// Card fields only, with just the author's username
const projectCardQuery = {
  select: { name: true, author: true, coverImage: true, likeCount: true },
  populate: { [Slugs.Collections.MEMBER]: { username: true } },
} as const

interface FindProjectsArgs {
  where?: Where
  sort: ProjectSort
  page: number
}

const findProjects = async ({ where, sort, page }: FindProjectsArgs): Promise<ProjectsPage> => {
  const payload = await getPayloadClient()

  const { docs, totalPages } = await payload.find({
    collection: Slugs.Collections.PROJECT,
    where,
    sort: PROJECT_SORT_OPTIONS[sort].payloadSort,
    limit: PROJECTS_PER_PAGE,
    page,
    depth: 1,
    ...projectCardQuery,
  })
  return { projects: docs.map(toProjectCard), totalPages }
}

export const getProjectsCached = async (state: DiscoverState) => {
  "use cache"
  cacheTag(CacheTags.PROJECTS.ROOT, CacheTags.MEDIA)
  cacheLife("max")

  return getProjects(state)
}

export const getProjects = ({ tab, sort, page }: DiscoverState) =>
  findProjects({ where: PROJECT_TABS.find((option) => option.value === tab)?.where, sort, page })

/**
 * Not cached: open-ended queries rarely repeat, so caching them would only evict useful entries.
 */
export const searchProjects = async ({ q, sort, page }: SearchState) => {
  // Payload reads the current time in find, so wait for a real request instead of prerendering
  await connection()

  return findProjects({ where: q ? { name: { contains: q } } : undefined, sort, page })
}

export const getProjectByID = async (id: string) => {
  if (!objectIDSchema.safeParse(id).success) return null

  const payload = await getPayloadClient()
  const project = await payload.findByID({
    collection: Slugs.Collections.PROJECT,
    id,
    // 2 so the author's profile picture is populated too
    depth: 2,
    disableErrors: true,
    populate: {
      [Slugs.Collections.MEMBER]: {
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
      },
    },
  })
  if (!project) return null
  return project
}

/**
 * A project with its author and media populated, or `null` when it does not exist
 */
export const getProjectByIDCached = async (id: string) => {
  "use cache"
  cacheTag(CacheTags.PROJECTS.ID(id), CacheTags.MEDIA)
  cacheLife("max")
  const project = await getProjectByID(id)
  if (!project) return null
  cacheTag(CacheTags.MEMBERS.ID(getRelationID(project.author)))
  return project
}

export const getProjectsByAuthor = async (memberID: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: Slugs.Collections.PROJECT,
    where: { author: { equals: memberID } },
    sort: "-createdAt",
    pagination: false,
    depth: 1,
    ...projectCardQuery,
    // The profile card also shows the summary
    select: { ...projectCardQuery.select, summary: true },
  })
  return docs.map(toProjectCard)
}

/**
 * Every project by one member, newest first
 */
export const getProjectsByAuthorCached = async (memberID: string) => {
  "use cache"
  cacheTag(CacheTags.PROJECTS.AUTHOR(memberID), CacheTags.MEDIA)
  cacheLife("max")

  return getProjectsByAuthor(memberID)
}

/** `not-found` also covers another member's project, so its ID stays hidden. */
export type EditableProjectResult =
  | { status: "found"; project: Project }
  | { status: "unauthenticated" | "unavailable" | "not-found" }

/**
 * The project for the editor if the signed-in member is its author
 *
 * Not cached: a stale copy in the editor would overwrite newer content on save.
 */
export const getEditableProject = async (id: string): Promise<EditableProjectResult> => {
  if (!objectIDSchema.safeParse(id).success) return { status: "not-found" }

  const current = await getCurrentMember()
  if (current.status !== "authenticated") return { status: current.status }

  const payload = await getPayloadClient()
  const project = await payload.findByID({
    collection: Slugs.Collections.PROJECT,
    id,
    depth: 1,
    disableErrors: true,
    // The editor needs the media, not the member
    populate: { [Slugs.Collections.MEMBER]: { username: true } },
  })
  if (!project || getRelationID(project.author) !== current.member.id) {
    return { status: "not-found" }
  }

  return { status: "found", project }
}
