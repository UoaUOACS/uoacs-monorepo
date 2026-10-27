import { AnimatedSuspense, SessionUnavailable } from "@uoacs/ui"
import { requireSession } from "@/features/auth/auth.queries"
import { ProjectEditor } from "@/features/project/components/ProjectEditor/ProjectEditor"
import { ProjectEditorSkeleton } from "@/features/project/components/ProjectEditor/ProjectEditorSkeleton"
import { projectFormOptions } from "@/features/project/editor/projectForm.options"
import { Routes } from "@/lib/routes"

const CreateProjectContent = async () => {
  const session = await requireSession(Routes.PROJECTS.CREATE)
  if (session.status === "unavailable") return <SessionUnavailable />

  return <ProjectEditor initialValues={projectFormOptions.defaultValues} />
}

export default function CreateProjectPage() {
  return (
    <AnimatedSuspense fallback={<ProjectEditorSkeleton create />}>
      <CreateProjectContent />
    </AnimatedSuspense>
  )
}
