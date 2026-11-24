"use client"

import { ArrowPathIcon, Bars3Icon } from "@heroicons/react/24/solid"
import { AuthPages, authPageUrl } from "@uoacs/shared"
import { Button, Dialog, Dropdown, type DropdownProps } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { type DeleteProjectResult, deleteProject } from "@/features/project/actions/deleteProject"
import { projectsUrl, Routes } from "@/lib/routes"

interface ProfileProjectCardMenuProps {
  projectID: string
  title: string
  className?: string
}

// The action returns bare codes, so map them to the messages shown in toasts
const errorDescriptions: Record<DeleteProjectResult["error"], string> = {
  unauthenticated: "Log in to delete projects",
  unavailable: "Something went wrong. Try again.",
  "not-found": "Project not found",
  server: "Something went wrong. Try again.",
}

/**
 * The owner's actions menu on a profile project card, with a confirm dialog for deleting
 *
 * Editing links to the project editor; deleting asks for confirmation, then calls the
 * delete action, which redirects to the profile on success.
 */
export const ProfileProjectCardMenu = ({
  projectID,
  title,
  className,
}: ProfileProjectCardMenuProps) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProject(projectID)
      // A successful delete redirects, so only failures resolve here
      if (result.ok) return
      setIsConfirming(false)
      if (result.error === "unauthenticated") {
        const loginHref = authPageUrl(AuthPages.LOGIN, projectsUrl(pathname))
        toast.error({
          description: errorDescriptions[result.error],
          action: (
            <a href={loginHref}>
              <Button size="sm">Log In</Button>
            </a>
          ),
        })
        return
      }
      console.error("[ProfileProjectCardMenu] delete was not saved", {
        error: result.error,
        projectID,
      })
      toast.error({ description: errorDescriptions[result.error] })
    } catch (error) {
      // A successful delete's redirect arrives here: Next rejects the action's promise
      // with its redirect error, and catching it suppresses the automatic navigation,
      // so go to the redirect's destination ourselves
      const digest = (error as { digest?: unknown } | null)?.digest
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
        const destination = digest.split(";").slice(2, -2).join(";")
        setIsConfirming(false)
        router.push(destination)
        return
      }
      console.error("[ProfileProjectCardMenu] delete request failed", error, { projectID })
      toast.error({ description: errorDescriptions.server })
    } finally {
      setIsDeleting(false)
    }
  }

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
    <div className={className}>
      <Dropdown
        label={
          <>
            <Bars3Icon className="size-5" />
            <span className="sr-only">Project actions</span>
          </>
        }
        options={menuOptions}
        popoverClassName="right-auto left-0 min-w-24 items-stretch"
        shape="rounded"
        size="icon"
        theme="primary"
        trigger={{ triggerIcon: false }}
      />
      <Dialog onClose={() => setIsConfirming(false)} open={isConfirming} title="Delete project?">
        <p className="paragraph text-gray-900">
          Permanently delete &ldquo;{title}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button disabled={isDeleting} onClick={() => setIsConfirming(false)} theme="light">
            Cancel
          </Button>
          <Button
            disabled={isDeleting}
            left={
              isDeleting ? (
                <ArrowPathIcon className="size-4 animate-spin motion-reduce:animate-none" />
              ) : undefined
            }
            onClick={() => void confirmDelete()}
            theme="dark"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
