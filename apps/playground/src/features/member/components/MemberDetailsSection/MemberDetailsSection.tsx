import type { Member } from "@uoacs/shared/payload"
import { Heading } from "@uoacs/ui"
import { editAuthMemberDetails } from "@/features/member/actions/editAuthMemberDetails"
import { MemberDetailsForm } from "../MemberDetailsForm/MemberDetailsForm"

export type MemberDetailsSectionProps = {
  /**
   * The member's record from the auth service.
   */
  member: Member
}

/**
 * The "General" content of the account page: the `// GENERAL` label, the "Your
 * Info" heading and the form for the member's shared details. It only fills the
 * space beside the sidebar, so the layout around it is up to the page.
 */
export const MemberDetailsSection = ({ member }: MemberDetailsSectionProps) => (
  <section className="flex w-full flex-col items-start gap-6">
    <div className="flex flex-col items-start gap-2">
      <p className="font-mono">
        {/** biome-ignore lint/suspicious/noCommentText: the // is not for a comment */}
        <span className="text-primary">// </span>GENERAL
      </p>
      <Heading h={3}>Your Info</Heading>
    </div>
    <MemberDetailsForm member={member} onSave={editAuthMemberDetails} />
  </section>
)
