import { AnimatedSuspense, SocialIcon, type SocialIconName } from "@uoacs/ui"
import Image from "next/image"
import Link from "next/link"
import { getSocialLinksCached } from "../../queries/social-links"
import { DiscordSection, DiscordSectionSkeleton } from "../DiscordSection"
import { CopyrightYear } from "./CopyrightYear"
import { InterestedButton } from "./InterestedButton"

export interface FooterSocialLink {
  icon: SocialIconName
  label: string
  href: string
}

export interface FooterProps {
  /**
   * Links to be displayed in the "Pages" column of the footer.
   */
  links: { label: string; href: string }[]
}

const PRIVACY_HREF = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/privacy`

/**
 * Social media icons from the website's CMS, excluding Discord, which has its own section.
 */
const FooterSocialLinks = async () => {
  const socialLinks = await getSocialLinksCached()
  if (socialLinks.length === 0) return null
  return (
    <nav aria-label="Social media links" className="flex flex-row items-start gap-4">
      {socialLinks
        .filter(({ icon }) => icon !== "discord")
        .map(({ icon, label, href }) => (
          <a
            aria-label={`Visit our ${label}`}
            className="flex flex-row items-center gap-2"
            href={href}
            key={label}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SocialIcon className="h-5 w-5" icon={icon} />
          </a>
        ))}
    </nav>
  )
}

/**
 * {@link DiscordSection} with the Discord link from the website's CMS as its fallback link.
 */
const FooterDiscordSection = async () => {
  const socialLinks = await getSocialLinksCached()
  const discordHref = socialLinks.find((link) => link.icon === "discord")?.href
  return <DiscordSection discordHref={discordHref} />
}

/**
 * A footer component for the project playground, containing links and social media icons.
 *
 * @param links Links to be displayed in the "Pages" column of the footer.
 */
export const Footer = ({ links }: FooterProps) => {
  return (
    <footer className="w-full">
      <div className="relative z-0 flex w-full justify-end">
        <Image
          alt=""
          className="-mb-16 size-48 md:-mb-20 md:size-64"
          height={356}
          priority
          src="/footer-mascot.png"
          width={356}
        />
      </div>
      <div className="relative z-10 grid w-full grid-cols-1 gap-4 bg-gray-800 p-5 text-white md:grid-cols-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <p className="paragraph-sm text-gray-400">
                UOACS &copy; <CopyrightYear />
              </p>
              <Link
                className="paragraph-xs w-fit text-gray-400 transition-colors hover:text-white"
                href={PRIVACY_HREF}
              >
                Privacy Policy
              </Link>
            </div>
            <InterestedButton className="md:hidden" />
          </div>
          <AnimatedSuspense>
            <FooterSocialLinks />
          </AnimatedSuspense>
        </div>

        <AnimatedSuspense fallback={<DiscordSectionSkeleton />}>
          <FooterDiscordSection />
        </AnimatedSuspense>

        <nav aria-label="Footer navigation" className="hidden flex-col items-start gap-4 md:flex">
          <p className="paragraph-sm text-gray-400">Pages</p>
          {links.map(({ label, href }) => (
            <Link
              className="paragraph-sm w-fit font-medium hover:underline"
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="relative hidden md:block">
          <InterestedButton className="absolute top-0 right-0" />
        </div>
      </div>
    </footer>
  )
}
