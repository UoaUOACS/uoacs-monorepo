/**
 * Extra columns on the Better Auth user, shared so the server config and the
 * client's inferred session type cannot drift.
 *
 * The member row is the source of truth for names. `input: false` stops people
 * setting them through `/update-user`; the auth service writes them instead.
 */
export const userAdditionalFields = {
  firstName: { type: "string", required: false, input: false },
  lastName: { type: "string", required: false, input: false },
} as const
