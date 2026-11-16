"use client"

import { genderSchema, type Member } from "@uoacs/shared/payload"
import { Input, MultiSelect, Radio, Select, ToggleableInput } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { useState } from "react"
import { ApiError } from "@/lib/api/api-client"
import { useUpdateMember } from "@/queries/useUpdateMember"
import type { UpdateMemberInput } from "@/types/schemas/member"

const STUDY_YEAR_OPTIONS = [
  { label: "First Year", value: "first-year" },
  { label: "Second Year", value: "second-year" },
  { label: "Third Year", value: "third-year" },
  { label: "Fourth Year", value: "fourth-year" },
  { label: "Fifth Year or Above", value: "fifth-year-or-above" },
]

const OTHER_MAJORS_OPTIONS = [
  "Information and Technology Management",
  "Software Engineering",
  "Information Systems",
  "Mathematics",
]

export const MemberDetailsForm = ({ member }: { member: Member }) => {
  const [firstName, setFirstName] = useState(member.firstName ?? "")
  const [lastName, setLastName] = useState(member.lastName ?? "")
  const [email, setEmail] = useState(member.email ?? "")
  const [upi, setUpi] = useState(member.upi ?? "")
  const [uoaID, setUoaID] = useState(member.uoaID ?? "")
  const [phoneNumber, setPhoneNumber] = useState(member.phoneNumber ?? "")
  const [gender, setGender] = useState<string>(member.gender ?? "")
  const [studyYear, setStudyYear] = useState<string>(member.studyYear ?? "")
  const [compsciStudent, setCompsciStudent] = useState(
    member.compsciStudent === true ? "Yes" : member.compsciStudent === false ? "No" : undefined,
  )
  const [otherMajors, setOtherMajors] = useState<string[]>(member.otherMajors ?? [])

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateMemberInput, string>>>({})
  const { mutateAsync } = useUpdateMember()

  const saveField = async <K extends keyof UpdateMemberInput>(
    field: K,
    value: UpdateMemberInput[K],
  ) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    try {
      await mutateAsync({ [field]: value } as Partial<UpdateMemberInput>)
      toast.success({ description: "Profile updated" })
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors && err.fieldErrors.length > 0) {
        setErrors((prev) => {
          const next = { ...prev }
          for (const fieldError of err.fieldErrors ?? []) {
            next[fieldError.field as keyof UpdateMemberInput] = fieldError.message
          }
          return next
        })
      } else {
        console.error("[MemberDetailsForm] saveField failed", { field, error: err })
        toast.error({
          description:
            err instanceof ApiError ? err.message : "An error occurred while updating your profile",
        })
      }
      throw err
    }
  }

  const cancelField = <K extends keyof UpdateMemberInput>(field: K, reset: () => void) => {
    reset()
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <ToggleableInput
        displayNode={firstName}
        error={errors.firstName}
        label="First Name"
        onCancel={() => cancelField("firstName", () => setFirstName(member.firstName ?? ""))}
        onSave={() => saveField("firstName", firstName)}
      >
        <Input onChange={(e) => setFirstName(e.target.value)} type="text" value={firstName} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={lastName}
        error={errors.lastName}
        label="Last Name"
        onCancel={() => cancelField("lastName", () => setLastName(member.lastName ?? ""))}
        onSave={() => saveField("lastName", lastName)}
      >
        <Input onChange={(e) => setLastName(e.target.value)} type="text" value={lastName} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={email}
        label="Email"
        locked
        lockedReason="Email is used for login and cannot be changed here"
      >
        <Input onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={upi}
        error={errors.upi}
        label="UPI"
        onCancel={() => cancelField("upi", () => setUpi(member.upi ?? ""))}
        onSave={() => saveField("upi", upi)}
      >
        <Input
          hint="Not a UOA student? Enter N/A"
          onChange={(e) => setUpi(e.target.value)}
          type="text"
          value={upi}
        />
      </ToggleableInput>

      <ToggleableInput
        displayNode={uoaID}
        error={errors.uoaID}
        label="UOA ID Number"
        onCancel={() => cancelField("uoaID", () => setUoaID(member.uoaID ?? ""))}
        onSave={() => saveField("uoaID", uoaID)}
      >
        <Input
          hint="Not a UOA student? Enter N/A"
          onChange={(e) => setUoaID(e.target.value)}
          type="text"
          value={uoaID}
        />
      </ToggleableInput>

      <ToggleableInput
        displayNode={gender}
        error={errors.gender}
        label="Gender"
        onCancel={() => cancelField("gender", () => setGender(member.gender ?? ""))}
        onSave={() => saveField("gender", gender as UpdateMemberInput["gender"])}
      >
        <Select onChange={setGender} options={genderSchema.options} value={gender} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={phoneNumber}
        error={errors.phoneNumber}
        label="Phone Number"
        onCancel={() => cancelField("phoneNumber", () => setPhoneNumber(member.phoneNumber ?? ""))}
        onSave={() => saveField("phoneNumber", phoneNumber)}
      >
        <Input onChange={(e) => setPhoneNumber(e.target.value)} type="text" value={phoneNumber} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={compsciStudent ?? ""}
        error={errors.compsciStudent}
        label="Are you a computer science student?"
        onCancel={() =>
          cancelField("compsciStudent", () =>
            setCompsciStudent(
              member.compsciStudent === true
                ? "Yes"
                : member.compsciStudent === false
                  ? "No"
                  : undefined,
            ),
          )
        }
        onSave={() => saveField("compsciStudent", compsciStudent === "Yes")}
      >
        <Radio
          onChange={setCompsciStudent}
          options={["Yes", "No"]}
          optionsClassName="flex-row"
          value={compsciStudent}
        />
      </ToggleableInput>

      <ToggleableInput
        displayNode={STUDY_YEAR_OPTIONS.find((o) => o.value === studyYear)?.label ?? studyYear}
        error={errors.studyYear}
        label="Year of Study"
        onCancel={() => cancelField("studyYear", () => setStudyYear(member.studyYear ?? ""))}
        onSave={() => saveField("studyYear", studyYear as UpdateMemberInput["studyYear"])}
      >
        <Select onChange={setStudyYear} options={STUDY_YEAR_OPTIONS} value={studyYear} />
      </ToggleableInput>

      <ToggleableInput
        displayNode={otherMajors.join(", ")}
        error={errors.otherMajors}
        label={compsciStudent === "Yes" ? "Other Majors (if any)" : "Other Majors"}
        onCancel={() => cancelField("otherMajors", () => setOtherMajors(member.otherMajors ?? []))}
        onSave={() => saveField("otherMajors", otherMajors)}
      >
        <MultiSelect
          customTextInput
          onChange={setOtherMajors}
          options={OTHER_MAJORS_OPTIONS}
          value={otherMajors}
        />
      </ToggleableInput>
    </div>
  )
}
