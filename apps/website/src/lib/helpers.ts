import type { SocialLink } from "@/components/Generic"
import { payload } from "./payload"
import { Slugs } from "./payload/slugs"

export async function getSocialLinks(): Promise<SocialLink[]> {
  const { discordHref, instagramHref, tiktokHref, linkedinHref } = await payload.findGlobal({
    slug: Slugs.Globals.SOCIAL_LINKS,
  })
  return [
    { icon: "instagram", label: "Instagram", href: instagramHref ?? "" },
    { icon: "tiktok", label: "TikTok", href: tiktokHref ?? "" },
    { icon: "linkedin", label: "LinkedIn", href: linkedinHref ?? "" },
    { icon: "discord", label: "Discord", href: discordHref ?? "" },
  ]
}
