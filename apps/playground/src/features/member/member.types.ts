import type { Member } from "@uoacs/shared/payload"
import type { Member as PlaygroundMember } from "@/payload/payload-types"

/** Mirrors `SessionResult`: `unavailable` is not "logged out". */
export type CurrentMemberResult =
  | { status: "authenticated"; member: PlaygroundMember }
  | { status: "unauthenticated" }
  | { status: "unavailable" }

/* Details for a UOACS member not a Playground member. */
export type AuthMemberDetailsResult =
  | { status: "authenticated"; member: Member }
  | { status: "unauthenticated" }
  | { status: "unavailable" }
  | { status: "not-found" }
