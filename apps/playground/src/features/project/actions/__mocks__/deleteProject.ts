import type { DeleteProjectResult } from "../deleteProject"

// The real action redirects, which Storybook cannot follow, so this resolves without a result
export async function deleteProject(_id: string): Promise<DeleteProjectResult> {
  return new Promise(() => {})
}
