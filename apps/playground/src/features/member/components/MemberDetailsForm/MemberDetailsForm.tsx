"use client"

import { type AnyFieldApi, useForm, useSelector } from "@tanstack/react-form"
import { memberResponseSchema } from "@uoacs/shared"
import type { Member, UpdateMemberInput } from "@uoacs/shared/payload"
import { Input, MultiSelect, Radio, Select, ToggleableInput } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { useRouter } from "next/navigation"
import type { EditAuthMemberDetailsResult } from "@/features/member/actions/editAuthMemberDetails"

const STUDY_YEAR_OPTIONS = [
  { label: "First Year", value: "first-year" },
  { label: "Second Year", value: "second-year" },
  { label: "Third Year", value: "third-year" },
  { label: "Fourth Year", value: "fourth-year" },
  { label: "Fifth Year or Above", value: "fifth-year-or-above" },
]

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"]

const OTHER_MAJORS_OPTIONS = [
  "Information and Technology Management",
  "Software Engineering",
  "Information Systems",
  "Mathematics",
]

type FormValues = {
  firstName: string
  lastName: string
  upi: string
  uoaID: string
  // Strings, not the enums: the Selects hand back plain strings and the auth
  // service may hold other values. The server action enforces the real options.
  gender: string
  phoneNumber: string
  compsciStudent: boolean | undefined
  studyYear: string
  otherMajors: string[]
}

/**
 * The email is left out: it is locked, so it is only ever displayed.
 */
const toFormValues = (member: Member): FormValues => ({
  firstName: member.firstName ?? "",
  lastName: member.lastName ?? "",
  upi: member.upi ?? "",
  uoaID: member.uoaID ?? "",
  gender: member.gender ?? "",
  phoneNumber: member.phoneNumber ?? "",
  compsciStudent: member.compsciStudent ?? undefined,
  studyYear: member.studyYear ?? "",
  otherMajors: member.otherMajors ?? [],
})

type FieldName = keyof FormValues

const toYesNo = (value: boolean | undefined) => {
  if (value === undefined) return undefined
  return value ? "Yes" : "No"
}

/**
 * Schema failures arrive as issue objects and server errors as plain strings.
 */
const fieldError = (field: AnyFieldApi): string | undefined => {
  const messages = field.state.meta.errors
    .map((error) => (typeof error === "string" ? error : error?.message))
    .filter(Boolean)
  return messages.length > 0 ? messages.join(", ") : undefined
}

export type MemberDetailsFormProps = {
  member: Member
  onSave: (patch: Partial<UpdateMemberInput>) => Promise<EditAuthMemberDetailsResult>
}

/**
 * Each field saves on its own: Edit, then Save or Close. The form holds the
 * values and validation; there is no whole-form submit.
 */
export const MemberDetailsForm = ({ member, onSave }: MemberDetailsFormProps) => {
  const router = useRouter()

  // `defaultValues` follows `member`, so `resetField` always returns to the saved value.
  const form = useForm({ defaultValues: toFormValues(member) })
  const compsciStudent = useSelector(form.store, (state) => state.values.compsciStudent)

  const saveField = async (field: AnyFieldApi) => {
    const errors = await field.validate("change")
    // Rejecting keeps the field in edit mode, with the error showing under it.
    if (errors.length > 0) throw new Error("Invalid value")

    let result: EditAuthMemberDetailsResult
    try {
      result = await onSave({ [field.name]: field.state.value } as Partial<UpdateMemberInput>)
    } catch (error) {
      console.error("[MemberDetailsForm] saveField failed", { field: field.name, error })
      toast.error({ description: "An error occurred while updating your profile" })
      throw error
    }

    if (result.ok) {
      toast.success({ description: "Profile updated" })
      // Re-reads the member so the saved value becomes what Close resets to.
      router.refresh()
      return
    }

    // A save can fail on another field, e.g. turning off "computer science
    // student" is rejected on "other majors", so errors go to their own fields.
    let shown = 0
    for (const { field: name, message } of result.fieldErrors ?? []) {
      if (!form.getFieldMeta(name as FieldName)) continue
      form.setFieldMeta(name as FieldName, (prev) => ({
        ...prev,
        errorMap: { ...prev.errorMap, onSubmit: message },
      }))
      shown++
    }
    if (shown === 0) toast.error({ description: result.message })

    throw new Error(result.message)
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <form.Field name="firstName" validators={{ onChange: memberResponseSchema.shape.firstName }}>
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="First Name"
            onCancel={() => form.resetField("firstName")}
            onSave={() => saveField(field)}
          >
            <Input
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="lastName" validators={{ onChange: memberResponseSchema.shape.lastName }}>
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="Last Name"
            onCancel={() => form.resetField("lastName")}
            onSave={() => saveField(field)}
          >
            <Input
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <ToggleableInput
        displayNode={member.email ?? ""}
        label="Email"
        locked
        lockedReason="Email is used for login and cannot be changed here"
      >
        <Input onChange={() => {}} type="email" value={member.email ?? ""} />
      </ToggleableInput>

      <form.Field name="upi" validators={{ onChange: memberResponseSchema.shape.upi }}>
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="UPI"
            onCancel={() => form.resetField("upi")}
            onSave={() => saveField(field)}
          >
            <Input
              hint="Not a UOA student? Enter N/A"
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="uoaID" validators={{ onChange: memberResponseSchema.shape.uoaID }}>
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="UOA ID Number"
            onCancel={() => form.resetField("uoaID")}
            onSave={() => saveField(field)}
          >
            <Input
              hint="Not a UOA student? Enter N/A"
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="gender">
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="Gender"
            onCancel={() => form.resetField("gender")}
            onSave={() => saveField(field)}
          >
            <Select
              onChange={field.handleChange}
              options={GENDER_OPTIONS}
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="phoneNumber">
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value}
            error={fieldError(field)}
            label="Phone Number"
            onCancel={() => form.resetField("phoneNumber")}
            onSave={() => saveField(field)}
          >
            <Input
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="compsciStudent">
        {(field) => (
          <ToggleableInput
            displayNode={toYesNo(field.state.value) ?? ""}
            error={fieldError(field)}
            label="Are you a computer science student?"
            onCancel={() => form.resetField("compsciStudent")}
            onSave={() => saveField(field)}
          >
            <Radio
              onChange={(value) => field.handleChange(value === "Yes")}
              options={["Yes", "No"]}
              optionsClassName="flex-row"
              value={toYesNo(field.state.value)}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="studyYear">
        {(field) => (
          <ToggleableInput
            displayNode={
              STUDY_YEAR_OPTIONS.find((option) => option.value === field.state.value)?.label ??
              field.state.value
            }
            error={fieldError(field)}
            label="Year of Study"
            onCancel={() => form.resetField("studyYear")}
            onSave={() => saveField(field)}
          >
            <Select
              onChange={field.handleChange}
              options={STUDY_YEAR_OPTIONS}
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>

      <form.Field name="otherMajors">
        {(field) => (
          <ToggleableInput
            displayNode={field.state.value.join(", ")}
            error={fieldError(field)}
            label={compsciStudent ? "Other Majors (if any)" : "Other Majors"}
            onCancel={() => form.resetField("otherMajors")}
            onSave={() => saveField(field)}
          >
            <MultiSelect
              customTextInput
              onChange={field.handleChange}
              options={OTHER_MAJORS_OPTIONS}
              value={field.state.value}
            />
          </ToggleableInput>
        )}
      </form.Field>
    </div>
  )
}
