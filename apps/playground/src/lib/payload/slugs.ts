export const Slugs = {
  Collections: {
    MEDIA: "media",
    ADMIN: "admin",
    PROJECT: "project",
    PROJECT_MEDIA: "projectMedia",
    MEMBER: "member",
    SPONSOR: "sponsor",
    LIKE: "like",
  },
  Globals: {},
  Blocks: {
    TEXT: "text",
    IMAGE_GRID: "imageGrid",
  },
} as const

export type CollectionSlug = (typeof Slugs.Collections)[keyof typeof Slugs.Collections]
export type GlobalSlug = (typeof Slugs.Globals)[keyof typeof Slugs.Globals]
export type BlockSlug = (typeof Slugs.Blocks)[keyof typeof Slugs.Blocks]
export type Slug = CollectionSlug | GlobalSlug
