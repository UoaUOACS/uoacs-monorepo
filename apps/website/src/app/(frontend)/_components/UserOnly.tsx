"use client"

import { AuthPages, authPageUrl } from "@uoacs/shared"
import { SessionUnavailable } from "@uoacs/ui"
import { type ReactNode, useEffect } from "react"
import { useSessionResult } from "@/context/SessionContext"
import { isLoggingOut, useGuardedPage } from "@/lib/auth/log-out"

export const UserOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) => {
  const { status } = useSessionResult()
  useGuardedPage()

  useEffect(() => {
    // A deliberate log-out sends the person home itself (see `logOut`).
    if (status === "unauthenticated" && !isLoggingOut()) {
      window.location.assign(authPageUrl(AuthPages.LOGIN, window.location.href))
    }
  }, [status])

  if (status === "unavailable") return <SessionUnavailable />
  if (status === "unauthenticated") return fallback
  return children
}
