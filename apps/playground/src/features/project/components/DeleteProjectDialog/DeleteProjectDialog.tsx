"use client"

import { Button, Dialog } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { unstable_rethrow } from "next/navigation"
import { useTransition } from "react"
import { deleteProject } from "@/features/project/actions/deleteProject"

interface DeleteProjectDialogProps {
  projectID: string
  open: boolean
  onClose: () => void
}

/**
 * Asks before deleting the project. The action redirects to the profile when it works.
 */
export const DeleteProjectDialog = ({ projectID, open, onClose }: DeleteProjectDialogProps) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () =>
    startTransition(async () => {
      try {
        // Only returns when the delete failed
        await deleteProject(projectID)
      } catch (error) {
        // The success redirect rejects too; anything else is a network or server failure
        unstable_rethrow(error)
        console.error("[DeleteProjectDialog] The delete request failed", { error, projectID })
      }
      toast.error({ description: "The project could not be deleted. Try again." })
      onClose()
    })

  return (
    <Dialog onClose={isPending ? () => {} : onClose} open={open} title="Delete project?">
      <div className="flex flex-col gap-6">
        <p className="paragraph">
          This removes the project page and its likes. You cannot undo it.
        </p>
        <div className="flex justify-end gap-2">
          <Button disabled={isPending} onClick={onClose} theme="dark">
            Cancel
          </Button>
          <Button
            aria-busy={isPending || undefined}
            disabled={isPending}
            onClick={handleDelete}
            theme="ghost"
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
