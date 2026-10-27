import type { CollectionConfig } from "payload"
import {
  PROJECT_MAX_BLOCKS,
  PROJECT_SUMMARY_MAX_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "@/features/project/project.constants"
import { CacheTags } from "@/lib/cache"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Slugs } from "@/lib/payload/slugs"
import { ImageGrid } from "../blocks/ImageGrid"
import { Text } from "../blocks/Text"
import { makeDeleteLikesHook } from "../hooks/deleteLikes"
import { deleteProjectMedia, deleteRemovedProjectMedia } from "../hooks/deleteProjectMedia"
import { makeRevalidateHooks } from "../hooks/revalidate"
import type { Project as ProjectDoc } from "../payload-types"
import { authorsProjectMedia } from "./ProjectMedia"

const { afterChange, afterDelete } = makeRevalidateHooks((doc: ProjectDoc) => [
  CacheTags.PROJECTS.ROOT,
  CacheTags.PROJECTS.ID(doc.id),
  CacheTags.PROJECTS.AUTHOR(getRelationID(doc.author)),
])

export const Project: CollectionConfig = {
  slug: Slugs.Collections.PROJECT,
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: PROJECT_TITLE_MAX_LENGTH,
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: PROJECT_SUMMARY_MAX_LENGTH,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: Slugs.Collections.MEMBER,
      required: true,
    },
    {
      name: "collaborators",
      type: "text", // TODO: update to relationship once member collection set up
      hasMany: true,
      required: false,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: Slugs.Collections.PROJECT_MEDIA,
      required: true,
      filterOptions: authorsProjectMedia,
    },
    {
      name: "likeCount",
      type: "number",
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        readOnly: true,
        description: "Number of likes. Kept up to date by the Like collection.",
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    // TODO: add link to awards once collection is set up
    {
      name: "pageContent",
      type: "blocks",
      blocks: [Text, ImageGrid],
      required: true,
      minRows: 1,
      maxRows: PROJECT_MAX_BLOCKS,
    },
  ],
  hooks: {
    afterChange: [afterChange, deleteRemovedProjectMedia],
    beforeDelete: [makeDeleteLikesHook("project")],
    afterDelete: [afterDelete, deleteProjectMedia],
  },
}
