import { ValidationError } from "payload"
import { buildUsername } from "@/features/member/helpers/username"
import type { AuthNames } from "@/features/member/member.queries"
import { Slugs } from "@/lib/payload"
import { getPayloadClient } from "@/lib/payload/getPayloadClient"
import type { Member } from "@/payload/payload-types"

const USERNAME_ATTEMPTS = 5

/** Matched on the field rather than the message, which Payload translates. */
export const isUsernameClash = (err: unknown): boolean =>
  err instanceof ValidationError && err.data?.errors?.some((e) => e.path === "username") === true

/**
 * Throws if the member could not be created, including when another request
 * created one first. The caller re-reads to tell those apart, since the
 * database is a better answer than the error.
 */
export async function createMember(betterAuthUserId: string, names: AuthNames): Promise<Member> {
  const payload = await getPayloadClient()

  for (let attempt = 0; attempt < USERNAME_ATTEMPTS; attempt++) {
    try {
      return await payload.create({
        collection: Slugs.Collections.MEMBER,
        // Single write, so a transaction gains nothing and would turn a concurrent
        // insert into a write conflict rather than the duplicate key the caller re-reads past.
        disableTransaction: true,
        data: {
          ...names,
          betterAuthUserId,
          username: buildUsername(names.firstName, names.lastName),
        },
      })
    } catch (err) {
      if (!isUsernameClash(err)) throw err
    }
  }

  throw new Error(
    `Could not find a free username for member ${betterAuthUserId} in ${USERNAME_ATTEMPTS} attempts`,
  )
}

/**
 * Writes the auth service's names onto the stored copy when they have drifted.
 * Does nothing when they already match or when the auth service could not be
 * reached. Belongs in `after()`: the member is already usable without it, so a
 * failure must not reach the page, and the collection's revalidate hook only
 * works outside a render.
 */
export async function syncNames(member: Member, names: AuthNames | null): Promise<void> {
  if (!names) return
  if (member.firstName === names.firstName && member.lastName === names.lastName) return

  const payload = await getPayloadClient()
  await payload.update({
    collection: Slugs.Collections.MEMBER,
    id: member.id,
    data: names,
  })
}
