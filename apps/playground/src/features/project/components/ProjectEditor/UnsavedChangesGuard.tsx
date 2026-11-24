"use client"

import { Button, Dialog } from "@uoacs/ui"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface UnsavedChangesGuardProps {
  isDirty: boolean
}

type PendingNavigation = { href: string } | { historyKey: string }

/**
 * Asks before a link click or a back or forward within the app leaves the page with unsaved
 * changes. The browser asks before a reload, a closed tab or a link to another site. Back and
 * forward go unguarded in browsers without the Navigation API.
 */
export const UnsavedChangesGuard = ({ isDirty }: UnsavedChangesGuardProps) => {
  const router = useRouter()
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>()
  const isLeavingConfirmedRef = useRef(false)

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    // Captured on the window, so it runs before `Link`, which runs its `onClick` but skips the
    // navigation of a prevented click
    const interceptLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return
      }
      const url = new URL(link.href)
      // Other sites leave through `beforeunload`, and in-page anchors keep the changes
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return
      event.preventDefault()
      setPendingNavigation({ href: url.pathname + url.search + url.hash })
    }

    // Only traversals within this document can be cancelled; the rest leave through `beforeunload`
    const interceptTraversal = (event: NavigateEvent) => {
      if (event.navigationType !== "traverse" || !event.cancelable) return
      if (isLeavingConfirmedRef.current) {
        isLeavingConfirmedRef.current = false
        return
      }
      event.preventDefault()
      setPendingNavigation({ historyKey: event.destination.key })
    }
    window.addEventListener("beforeunload", warn)
    window.addEventListener("click", interceptLink, true)
    if ("navigation" in window) window.navigation.addEventListener("navigate", interceptTraversal)
    return () => {
      window.removeEventListener("beforeunload", warn)
      window.removeEventListener("click", interceptLink, true)
      if ("navigation" in window)
        window.navigation.removeEventListener("navigate", interceptTraversal)
    }
  }, [isDirty])

  const leave = () => {
    if (!pendingNavigation) return
    if ("href" in pendingNavigation) {
      router.push(pendingNavigation.href)
    } else {
      isLeavingConfirmedRef.current = true
      window.navigation.traverseTo(pendingNavigation.historyKey)
    }
    setPendingNavigation(undefined)
  }

  return (
    <Dialog
      onClose={() => setPendingNavigation(undefined)}
      open={pendingNavigation !== undefined}
      title="Leave without saving?"
    >
      <div className="flex flex-col gap-6">
        <p className="paragraph-sm">You have unsaved changes. They will be lost if you leave.</p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setPendingNavigation(undefined)} theme="dark">
            Keep editing
          </Button>
          <Button onClick={leave} theme="ghost">
            Leave
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
