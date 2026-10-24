import type { Member } from "@uoacs/shared/payload"
import type { CollectionAfterChangeHook } from "payload"

/**
 * Keeps the Better Auth user's names in step with every write, admin panel
 * edits included. Imported lazily because `auth` reaches back into the Payload
 * config, and needs env vars that `payload generate:types` does not have.
 */
export const syncAccountName: CollectionAfterChangeHook<Member> = async ({
  doc,
  previousDoc,
  operation,
}) => {
  if (!doc.betterAuthUserId) return
  if (
    operation === "update" &&
    doc.firstName === previousDoc.firstName &&
    doc.lastName === previousDoc.lastName
  ) {
    return
  }

  const { MemberService } = await import("@/services/member.service")
  await new MemberService().syncAccountName(doc.betterAuthUserId, doc)
}
