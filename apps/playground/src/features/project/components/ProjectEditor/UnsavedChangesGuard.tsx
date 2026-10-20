"use client"

import { Button, Dialog } from "@uoacs/ui"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UnsavedChangesGuardProps {
  isDirty: boolean
}

/**
 * Asks before a link click leaves the page with unsaved changes. The browser asks before a
 * reload, a closed tab or a link to another site.
 */
export const UnsavedChangesGuard = ({ isDirty }: UnsavedChangesGuardProps) => {
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string>()

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    // Captured on the window, so it runs before `Link` starts a client navigation
    const interceptLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.download) return
      const url = new URL(link.href)
      // Other sites leave through `beforeunload`, and in-page anchors keep the changes
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return
      event.preventDefault()
      event.stopPropagation()
      setPendingHref(url.pathname + url.search + url.hash)
    }
    window.addEventListener("beforeunload", warn)
    window.addEventListener("click", interceptLink, true)
    return () => {
      window.removeEventListener("beforeunload", warn)
      window.removeEventListener("click", interceptLink, true)
    }
  }, [isDirty])

  return (
    <Dialog
      onClose={() => setPendingHref(undefined)}
      open={pendingHref !== undefined}
      title="Leave without saving?"
    >
      <div className="flex flex-col gap-6">
        <p className="paragraph-sm">You have unsaved changes. They will be lost if you leave.</p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setPendingHref(undefined)} theme="dark">
            Keep editing
          </Button>
          <Button
            onClick={() => {
              if (pendingHref) router.push(pendingHref)
              setPendingHref(undefined)
            }}
            theme="ghost"
          >
            Leave
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
