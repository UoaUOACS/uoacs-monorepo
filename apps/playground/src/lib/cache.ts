import type { DeepValues } from "./routes"

export const CacheTags = {
  SPONSORS: "sponsors",
  MEDIA: "media",
  PROJECTS: {
    ROOT: "projects",
    ID: (id: string) => `project:${id}` as const,
    AUTHOR: (memberID: string) => `project-author:${memberID}` as const,
  },
  MEMBERS: {
    ID: (id: string) => `member:${id}` as const,
    LIKES: (id: string) => `member-likes:${id}` as const,
  },
} as const

export type CacheTag = DeepValues<typeof CacheTags>
