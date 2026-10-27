import { fn } from "storybook/test"
import type { SaveProjectResult } from "../saveProject"

// A spy, so a story can return an error with `mocked(saveProject).mockResolvedValue`
export const saveProject = fn(
  async (_input: unknown): Promise<SaveProjectResult> => ({
    ok: true,
    id: "000000000000000000000001",
  }),
)
