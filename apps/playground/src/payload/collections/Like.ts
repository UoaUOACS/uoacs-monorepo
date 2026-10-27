import type { CollectionConfig, PayloadRequest } from "payload"
import { CacheTags } from "@/lib/cache"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Slugs } from "@/lib/payload/slugs"
import { adjustLikeCount } from "../hooks/adjustLikeCount"
import { makeRevalidateHooks, revalidateTags } from "../hooks/revalidate"
import type { Like as LikeDoc } from "../payload-types"

// The like count is changed outside Payload, so the Project hooks do not revalidate for it
const { afterChange, afterDelete } = makeRevalidateHooks((doc: LikeDoc) => [
  CacheTags.PROJECTS.ROOT,
  CacheTags.PROJECTS.ID(getRelationID(doc.project)),
  CacheTags.MEMBERS.LIKES(getRelationID(doc.member)),
])

// The count also shows on the author's profile, so refresh their project list too
const adjustCount = async (req: PayloadRequest, doc: LikeDoc, delta: 1 | -1) => {
  const authorID = await adjustLikeCount(req, getRelationID(doc.project), delta)
  if (authorID) revalidateTags([CacheTags.PROJECTS.AUTHOR(authorID)], req, `like ${doc.id} count`)
}

export const Like: CollectionConfig = {
  slug: Slugs.Collections.LIKE,
  access: {
    read: () => true,
    // A like is only created or deleted, so its project and member cannot move
    update: () => false,
  },
  indexes: [{ fields: ["project", "member"], unique: true }],
  fields: [
    {
      name: "project",
      type: "relationship",
      relationTo: Slugs.Collections.PROJECT,
      required: true,
      index: true,
    },
    {
      name: "member",
      type: "relationship",
      relationTo: Slugs.Collections.MEMBER,
      required: true,
      index: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create") await adjustCount(req, doc, 1)
      },
      afterChange,
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await adjustCount(req, doc, -1)
      },
      afterDelete,
    ],
  },
}
