import { AuthPages, authPageUrl } from "@uoacs/shared"
import { getSession } from "@uoacs/shared/auth/server"
import { SessionUnavailable } from "@uoacs/ui"
import { redirect } from "next/navigation"
import { Routes, websiteUrl } from "@/lib/routes"
import { UserOnly } from "../_components/UserOnly"
import { ProfilePageClient } from "./_components/ProfilePageClient"

export default async function ProfilePage() {
  const result = await getSession()
  if (result.status === "unauthenticated") {
    redirect(authPageUrl(AuthPages.LOGIN, websiteUrl(Routes.PROFILE)))
  }
  if (result.status === "unavailable") return <SessionUnavailable />
  return (
    <UserOnly>
      <ProfilePageClient user={result.session.user} />
    </UserOnly>
  )
}
