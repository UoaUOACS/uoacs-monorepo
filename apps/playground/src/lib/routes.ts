import type { Project } from "@/features/project/components/ProjectCard/ProjectCard"
import type { Member } from "@/payload/payload-types"

export const Routes = {
  HOME: "/",
  PROFILE: {
    ROOT: "/profile",
    USERNAME: (username: Member["username"]) => `/profile/${username}`,
    EDIT: "/profile/edit",
  },
  SEARCH: "/search",
  PROJECTS: {
    ID: (id: Project["id"]) => `/projects/${id}`,
    EDIT: (id: Project["id"]) => `/projects/${id}/edit`,
    CREATE: "/projects/create",
  },
} as const

/**
 * Absolute playground URL for a path, for example to use as an auth return URL.
 *
 * @param path The path in the playground, for example `/profile`.
 * @returns The absolute URL.
 */
export function projectsUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_PROJECTS_URL
  if (!base) throw new Error("Missing required environment variable: NEXT_PUBLIC_PROJECTS_URL")
  return new URL(path, base).toString()
}

export type DeepValues<T> = T extends (...args: never[]) => infer R
  ? R
  : T extends object
    ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
    : T

export type AppRoute = DeepValues<typeof Routes>
