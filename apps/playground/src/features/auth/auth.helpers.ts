import { AuthPages, authPageUrl } from "@uoacs/shared"
import { redirect } from "next/navigation"
import { projectsUrl } from "@/lib/routes"

/**
 * Sends the visitor to the hosted login page, and back to `path` once they are done
 */
export function redirectToLogin(path: string): never {
  redirect(authPageUrl(AuthPages.LOGIN, projectsUrl(path)))
}
