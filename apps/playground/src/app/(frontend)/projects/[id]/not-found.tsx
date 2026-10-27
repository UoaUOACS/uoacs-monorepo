import { Button, EmptyState } from "@uoacs/ui"
import Link from "next/link"
import { Routes } from "@/lib/routes"

export default function ProjectNotFound() {
  return (
    <EmptyState
      action={
        <Link href={Routes.SEARCH}>
          <Button>Search Projects</Button>
        </Link>
      }
      className="my-auto"
      description="The project you are looking for does not exist."
      title="Project Not Found"
    />
  )
}
