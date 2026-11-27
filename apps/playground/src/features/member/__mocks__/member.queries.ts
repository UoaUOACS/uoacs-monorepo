import { fn } from "storybook/test"
import type { CurrentMemberResult } from "../member.types"

// A spy, so a story can sign a member in with `mocked(getCurrentMember).mockResolvedValue`
export const getCurrentMember = fn(
  async (): Promise<CurrentMemberResult> => ({ status: "unauthenticated" }),
)

export const getMemberByUsernameCached = fn(async () => null)
