import { Skeleton } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { type ProfileAboutVariants, profileAboutVariants } from "./ProfileAbout.variants"
import { SectionLabel } from "./SectionLabel/SectionLabel"

export interface ProfileAboutProps extends ProfileAboutVariants {
  /** The member's major(s), e.g. ["Computer Science", "Finance"]. */
  // major?: readonly string[]
  /** The member's biography (`Member.bio`), rendered as written. */
  biography?: string | null
  /** The member's languages. No data source exists yet; shows N/A until provided. */
  languages?: readonly string[]
  /** The member's skills (`Member.skills`). */
  skills?: readonly string[]
  className?: string
}

type AboutSection = {
  label: string
  content: readonly string[]
  multiline?: boolean
}

/**
 * The profile's "About" tab: the member's major, biography, languages and
 * skills as `// LABEL` sections. All sections render no matter what — empty
 * ones show a muted N/A. Presentational only.
 */
export const ProfileAbout = ({ /* major, */ biography, skills, className }: ProfileAboutProps) => {
  const { root, section, paragraph, placeholder, list } = profileAboutVariants()

  const sections: AboutSection[] = [
    // { label: "MAJOR", content: major ?? [] },
    { label: "BIOGRAPHY", content: biography?.trim() ? [biography] : [], multiline: true },
    { label: "SKILLS", content: skills ?? [] },
  ]

  return (
    <div className={cn(root(), className)}>
      {sections.map(({ label, content, multiline }) => (
        <section className={section()} key={label}>
          <SectionLabel>{label}</SectionLabel>
          {content.length === 0 ? (
            <p className={placeholder()}>N/A</p>
          ) : multiline ? (
            <p className={paragraph()}>{content[0]}</p>
          ) : (
            <ul className={list()}>
              {content.map((line) => (
                <li className={paragraph()} key={line}>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

/**
 * A loading placeholder with the same layout as {@link ProfileAbout}.
 */
export const ProfileAboutSkeleton = ({ className }: { className?: string }) => {
  const { root, section } = profileAboutVariants()

  return (
    <div aria-hidden="true" className={cn(root(), className)}>
      {[0, 1, 2, 3].map((index) => (
        <section className={section()} key={index}>
          <Skeleton className="w-28" shape="text" />
          <Skeleton className="w-full max-w-lg" shape="text" />
          {index === 1 && <Skeleton className="w-full max-w-md" shape="text" />}
        </section>
      ))}
    </div>
  )
}
