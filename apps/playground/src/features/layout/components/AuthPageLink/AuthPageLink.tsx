"use client"

import { type AuthPage, authPageUrl } from "@uoacs/shared"
import { usePathname } from "next/navigation"
import { type ComponentProps, Suspense } from "react"
import { projectsUrl } from "@/lib/routes"

/**
 * Props for the {@link AuthPageLink} component.
 */
export interface AuthPageLinkProps extends Omit<ComponentProps<"a">, "href"> {
  /**
   * Auth app page to link to.
   */
  page: AuthPage
}

/**
 * A link to a hosted auth app page that returns the user to the current page.
 *
 * @param page Auth app page to link to.
 * @returns An anchor to the auth page.
 */
export const AuthPageLink = ({ page, ...props }: AuthPageLinkProps) => (
  // usePathname needs Suspense on dynamic routes; no href until the return URL is known
  <Suspense fallback={<a aria-disabled {...props} />}>
    <AuthPageLinkWithReturn page={page} {...props} />
  </Suspense>
)

const AuthPageLinkWithReturn = ({ page, ...props }: AuthPageLinkProps) => (
  <a href={authPageUrl(page, projectsUrl(usePathname()))} {...props} />
)
