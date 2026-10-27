"use client"

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { Button, Dropdown } from "@uoacs/ui"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { projectFormOptions } from "@/features/project/editor/projectForm.options"
import { withForm } from "@/lib/form/useAppForm"
import { Routes } from "@/lib/routes"
import { DeleteProjectDialog } from "./DeleteProjectDialog"

/**
 * Sticky actions above the editor: preview, discard, save, the save error, and a menu with delete
 */
export const ProjectEditorToolbar = withForm({
  ...projectFormOptions,
  props: {
    /**
     * Omitted for a project that is not saved yet
     */
    projectID: undefined as string | undefined,
    /**
     * The last failed save's summary, until the next save
     */
    error: undefined as string | undefined,
  },
  render: function Render({ form, projectID, error }) {
    const router = useRouter()
    const [deleteOpen, setDeleteOpen] = useState(false)

    return (
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-end gap-x-1 gap-y-2 bg-white py-3 sm:gap-x-4">
        {error && (
          <form.Subscribe
            selector={(state) =>
              Object.values(state.fieldMeta).filter((meta) => meta?.errors.length).length
            }
          >
            {(fieldCount) => (
              <p className="mr-auto text-red-600 text-sm" role="alert">
                {error}
                {fieldCount > 0 && ` (${fieldCount})`}
              </p>
            )}
          </form.Subscribe>
        )}
        {/* Preview mode comes with the reorder and preview work */}
        <Button className="disabled:text-gray-400 max-sm:px-2" disabled theme="ghost">
          Preview
        </Button>
        <Button
          className="max-sm:px-2"
          // Client navigation, so the unsaved changes warning does not show
          onClick={() =>
            router.push(projectID ? Routes.PROJECTS.ID(projectID) : Routes.PROFILE.ROOT)
          }
          theme="ghost"
        >
          {/* One span, as the button spaces out its children */}
          <span>
            Discard<span className="max-sm:hidden"> Changes</span>
          </span>
        </Button>
        <form.SubmitButton theme="dark">
          <span>
            {projectID ? "Update" : "Create"}
            <span className="max-sm:hidden"> Project</span>
          </span>
        </form.SubmitButton>
        {projectID && (
          <>
            <Dropdown
              label={<span className="sr-only">More actions</span>}
              options={[
                {
                  label: "Delete project",
                  onClick: () => setDeleteOpen(true),
                  theme: "ghost",
                  className: "w-full text-red-600",
                },
              ]}
              popoverClassName="items-stretch gap-0 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
              shape="pill"
              size="icon"
              theme="ghost"
              trigger={{
                triggerClassName: "size-8 sm:size-10",
                triggerIcon: <EllipsisHorizontalIcon aria-hidden className="size-5 sm:size-6" />,
              }}
            />
            <DeleteProjectDialog
              onClose={() => setDeleteOpen(false)}
              open={deleteOpen}
              projectID={projectID}
            />
          </>
        )}
      </div>
    )
  },
})
