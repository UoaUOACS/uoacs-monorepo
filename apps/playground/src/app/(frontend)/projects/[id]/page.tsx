import { AnimatedSuspense, Skeleton } from "@uoacs/ui"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BlockView } from "@/features/project/components/BlockViews/BlockView"
import {
  ProjectHeader,
  ProjectHeaderActionsSkeleton,
  ProjectHeaderSkeleton,
} from "@/features/project/components/ProjectHeader/ProjectHeader"
import { ProjectHeaderActions } from "@/features/project/components/ProjectHeader/ProjectHeaderActions"
import { getProjectByIDCached } from "@/features/project/project.queries"

const LAYOUT_CLASS_NAME = "flex w-full flex-col gap-10 md:gap-14"

const ProjectContent = async ({ params }: Pick<PageProps<"/projects/[id]">, "params">) => {
  const { id } = await params
  const project = await getProjectByIDCached(id)
  if (!project) notFound()

  return (
    <article className={LAYOUT_CLASS_NAME}>
      <ProjectHeader
        actions={
          <Suspense fallback={<ProjectHeaderActionsSkeleton />}>
            <ProjectHeaderActions project={project} />
          </Suspense>
        }
        project={project}
      />
      <div className="flex flex-col gap-8">
        {project.pageContent.map((block, index) => (
          <BlockView block={block} key={block.id ?? index} />
        ))}
      </div>
    </article>
  )
}

export default function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  return (
    <AnimatedSuspense fallback={<ProjectPageSkeleton />}>
      <ProjectContent params={params} />
    </AnimatedSuspense>
  )
}

const ProjectPageSkeleton = () => (
  <div aria-hidden="true" className={LAYOUT_CLASS_NAME}>
    <ProjectHeaderSkeleton />
    <div className="flex flex-col gap-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="aspect-3/2 w-full" />
    </div>
  </div>
)
