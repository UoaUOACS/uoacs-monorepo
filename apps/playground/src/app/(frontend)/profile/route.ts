import { redirect } from "next/navigation"
import { redirectToLogin } from "@/features/auth/auth.helpers"
import { getCurrentMember } from "@/features/member/member.queries"
import { Routes } from "@/lib/routes"

// A route handler, not a page, so the router follows the redirect in one navigation
export const GET = async () => {
  const result = await getCurrentMember()
  if (result.status === "unauthenticated") redirectToLogin(Routes.PROFILE.ROOT)
  if (result.status === "unavailable") redirect(Routes.HOME)
  redirect(Routes.PROFILE.USERNAME(result.member.username))
}
