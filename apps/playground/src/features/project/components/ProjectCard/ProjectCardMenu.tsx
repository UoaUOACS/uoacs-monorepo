"use client"

import { Bars3Icon } from "@heroicons/react/24/solid"
import { Dropdown, type DropdownProps } from "@uoacs/ui"
import Image from "next/image"
import { Suspense, use, useState } from "react"
import { DeleteProjectDialog } from "@/features/project/components/DeleteProjectDialog/DeleteProjectDialog"
import { Routes } from "@/lib/routes"

interface ProjectCardMenuProps {
  projectID: string
  /**
   * Whether the signed-in member owns the project. Nothing shows until it resolves.
   */
  isOwner?: Promise<boolean>
  className?: string
}

/**
 * The owner's actions menu on a project card, shown only to the project's owner
 */
export const ProjectCardMenu = ({ isOwner, ...props }: ProjectCardMenuProps) =>
  isOwner ? (
    <Suspense fallback={null}>
      <StreamedProjectCardMenu {...props} isOwner={isOwner} />
    </Suspense>
  ) : null

// `use` suspends here, inside the boundary, so the rest of the card does not wait for the session
const StreamedProjectCardMenu = ({
  isOwner,
  ...props
}: ProjectCardMenuProps & { isOwner: Promise<boolean> }) =>
  use(isOwner) ? <ProjectCardMenuContent {...props} /> : null

/**
 * Editing links to the project editor; deleting opens the shared confirm dialog, whose
 * action redirects to the profile on success.
 */
const ProjectCardMenuContent = ({
  projectID,
  className,
}: Omit<ProjectCardMenuProps, "isOwner">) => {
  const [isConfirming, setIsConfirming] = useState(false)

  const menuOptions: DropdownProps["options"] = [
    {
      href: Routes.PROJECTS.EDIT(projectID),
      label: (
        <div className="flex flex-row items-center gap-2">
          <Image
            alt=""
            className="h-4 w-4 md:h-6 md:w-6"
            height={48}
            src="/edit-icon.png"
            width={48}
          />
          <p>Edit</p>
        </div>
      ),
      className:
        "w-full px-2 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      theme: "dark",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-2">
          <p>Delete</p>
        </div>
      ),
      onClick: () => setIsConfirming(true),
      className:
        "w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      theme: "dark",
    },
  ]

  return (
    <>
      <div className={className}>
        <Dropdown
          label={
            <>
              <Bars3Icon className="size-6" />
              <span className="sr-only">Project actions</span>
            </>
          }
          options={menuOptions}
          popoverClassName="right-auto left-0 min-w-24 items-stretch"
          size="icon"
          theme="primary"
          trigger={{ triggerIcon: false }}
        />
      </div>
      <DeleteProjectDialog
        onClose={() => setIsConfirming(false)}
        open={isConfirming}
        projectID={projectID}
      />
    </>
  )
}
