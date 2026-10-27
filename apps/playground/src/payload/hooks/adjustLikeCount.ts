import type { MongooseAdapter } from "@payloadcms/db-mongodb"
import type { PayloadRequest } from "payload"
import { Slugs } from "@/lib/payload/slugs"

/**
 * Changes a project's cached like count with an atomic `$inc`
 *
 * This goes around Payload, so concurrent likes cannot overwrite each other and the Project
 * hooks do not run. It joins the request's transaction, so a rolled-back like also rolls back
 * the count.
 *
 * Payload validation does not run here, so the decrement filter keeps the count at 0 or more.
 *
 * Returns the project's author ID, or `null` when the count did not change.
 */
export const adjustLikeCount = async (
  req: PayloadRequest,
  projectID: string,
  delta: 1 | -1,
): Promise<string | null> => {
  const db = req.payload.db as MongooseAdapter
  const transactionID = await req.transactionID
  const session = transactionID ? db.sessions[transactionID] : undefined

  const project = await db.collections[Slugs.Collections.PROJECT]
    .findOneAndUpdate(
      delta === -1 ? { _id: projectID, likeCount: { $gt: 0 } } : { _id: projectID },
      { $inc: { likeCount: delta } },
      { session, projection: { author: 1 } },
    )
    .lean<{ author: unknown }>()
  return project ? String(project.author) : null
}
