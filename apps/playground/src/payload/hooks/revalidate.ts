import { revalidateTag } from "next/cache"
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload"
import type { CacheTag } from "@/lib/cache"

/**
 * Revalidates each tag without failing the write that triggered it
 *
 * `revalidateTag` throws outside a Next.js request (e.g. seed scripts or the Payload CLI).
 * Pass `context: { disableRevalidate: true }` to the Local API call to skip revalidation there.
 */
export const revalidateTags = (tags: CacheTag[], req: PayloadRequest, source: string): void => {
  if (req.context.disableRevalidate) return

  for (const tag of tags) {
    try {
      revalidateTag(tag, "max")
      req.payload.logger.info(`Revalidated cache tag "${tag}" after ${source}`)
    } catch (err) {
      req.payload.logger.error({ err, source, tag }, `Failed to revalidate cache tag "${tag}"`)
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny: the document shape depends on the collection
type Tags = CacheTag[] | ((doc: any) => CacheTag[])

const resolveTags = (tags: Tags, doc: unknown): CacheTag[] =>
  typeof tags === "function" ? tags(doc) : tags

/**
 * Builds revalidation hooks for the given tags
 *
 * Set `skipCreate` when a new document cannot be in any cached data yet (e.g. an upload that
 * nothing references).
 */
export const makeRevalidateHooks = (
  tags: Tags,
  { skipCreate = false }: { skipCreate?: boolean } = {},
): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
  globalAfterChange: GlobalAfterChangeHook
} => ({
  afterChange: (({ collection, doc, operation, req }) => {
    if (skipCreate && operation === "create") return
    revalidateTags(resolveTags(tags, doc), req, `${collection.slug} ${doc.id} change`)
  }) satisfies CollectionAfterChangeHook,

  afterDelete: (({ collection, doc, id, req }) => {
    revalidateTags(resolveTags(tags, doc), req, `${collection.slug} ${id} delete`)
  }) satisfies CollectionAfterDeleteHook,

  globalAfterChange: (({ doc, global, req }) => {
    revalidateTags(resolveTags(tags, doc), req, `${global.slug} change`)
  }) satisfies GlobalAfterChangeHook,
})
