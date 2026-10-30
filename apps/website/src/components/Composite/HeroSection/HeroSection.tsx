import { Heading } from "@uoacs/ui"
import { type SocialLink, SocialLinks } from "@/components/Generic"

/**
 * HeroSection component for the homepage.
 */
export const HeroSection = ({
  discordPresenceCount,
  socialLinks,
}: {
  discordPresenceCount: number | null
  socialLinks: SocialLink[]
}) => {
  return (
    <section className="flex w-full max-w-180 flex-col items-center justify-start gap-6 self-center py-14 md:items-start md:gap-18 md:self-start md:py-0">
      <p className="hidden font-mono md:block">
        UNIVERSITY OF AUCKLAND
        <br />
        COMPUTER SCIENCE SOCIETY
      </p>
      <div className="flex flex-col justify-center gap-12 md:max-w-[38rem] md:justify-start">
        <div className="flex flex-col justify-center gap-6 text-center md:gap-12 md:text-left">
          <div className="self-center md:self-start">
            <Heading className="md:justify-start md:text-left" h={2}>
              Connecting Lives
            </Heading>
            <Heading className="md:justify-start md:text-left" h={2} period>
              Around Campus
            </Heading>
          </div>
          <p className="paragraph md:max-w-[28rem]">
            UOACS is the University of Auckland's Computer Science student community, connecting
            students through technical development, industry opportunities and a collaborative
            network.
          </p>
        </div>
        <div className="hidden h-1.5 w-full bg-linear-to-r from-[#FF307C] to-[#2134FF] mask-[linear-gradient(to_right,white,transparent)] md:block" />
        <SocialLinks
          activeDiscord
          discordPresenceCount={discordPresenceCount}
          links={socialLinks}
        />
      </div>
    </section>
  )
}
