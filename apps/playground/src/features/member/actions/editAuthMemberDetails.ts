"use server"

import { AuthApiRoutes } from "@uoacs/shared"
import { sessionFetch } from "@uoacs/shared/auth/server"
import { updateMemberSchema } from "@uoacs/shared/payload"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

export type EditAuthMemberDetailsError = { field: string; message: string }

export type EditAuthMemberDetailsResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: EditAuthMemberDetailsError[] }

const GENERIC_ERROR = "An error occurred while updating your profile"

/**
 * Returns a result rather than throwing, since an error thrown from a server
 * action loses its message and fields on the way to the client.
 */
export async function editAuthMemberDetails(input: unknown): Promise<EditAuthMemberDetailsResult> {
  const parsed = updateMemberSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    }
  }

  try {
    const response = await sessionFetch(AuthApiRoutes.MEMBER_ME, await headers(), {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5000),
    })
    if (response.ok) return { ok: true }

    const body = await response.json().catch(() => null)
    if (response.status < 500 && Array.isArray(body?.error)) {
      return { ok: false, message: "Validation failed", fieldErrors: body.error }
    }
    if (response.status === 401) {
      return { ok: false, message: "You need to be signed in to update your profile" }
    }
    console.error("[editProfile] Auth service answered with an error", {
      status: response.status,
    })
    return {
      ok: false,
      message:
        response.status < 500 && typeof body?.error === "string" ? body.error : GENERIC_ERROR,
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error("[editProfile] Failed to reach the auth service", { error })
    return { ok: false, message: GENERIC_ERROR }
  }
}
