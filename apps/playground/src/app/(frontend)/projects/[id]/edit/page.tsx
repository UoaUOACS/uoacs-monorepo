import { AnimatedSuspense, SessionUnavailable } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { redirectToLogin } from "@/features/auth/auth.helpers"
import { ProjectEditor } from "@/features/project/components/ProjectEditor/ProjectEditor"
import { ProjectEditorSkeleton } from "@/features/project/components/ProjectEditor/ProjectEditorSkeleton"
import { toFormValues, toMediaLookup } from "@/features/project/editor/projectForm.options"
import { getEditableProject } from "@/features/project/project.queries"
import { Routes } from "@/lib/routes"

const EditProjectContent = async ({ params }: Pick<PageProps<"/projects/[id]/edit">, "params">) => {
  const { id } = await params
  const result = await getEditableProject(id)
  if (result.status !== "found") {
    if (result.status === "unauthenticated") redirectToLogin(Routes.PROJECTS.EDIT(id))
    if (result.status === "unavailable") return <SessionUnavailable />
    return notFound()
  }

  const { project } = result
  const coverImageURL =
    typeof project.coverImage === "object" ? (project.coverImage.url ?? undefined) : undefined

  return (
    <ProjectEditor
      coverImageURL={coverImageURL}
      initialValues={toFormValues(project)}
      media={toMediaLookup(project)}
      projectID={project.id}
    />
  )
}

export default function EditProjectPage({ params }: PageProps<"/projects/[id]/edit">) {
  return (
    <AnimatedSuspense fallback={<ProjectEditorSkeleton />}>
      <EditProjectContent params={params} />
    </AnimatedSuspense>
  )
}
