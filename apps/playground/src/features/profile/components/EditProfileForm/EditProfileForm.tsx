"use client"

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { revalidateLogic } from "@tanstack/react-form"
import { Button, Select } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { type EditMemberResult, editMember } from "@/features/member/actions/editMember"
import { uploadProfilePicture } from "@/features/member/actions/uploadProfilePicture"
import { type LinkName, links } from "@/features/member/constants/links.constants"
import { skills } from "@/features/member/constants/skills.constants"
import { type EditMemberInput, editMemberSchema } from "@/features/member/schemas/editMember.schema"
import {
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
  MEDIA_UPLOAD_MAX_DIMENSION,
} from "@/features/project/project.constants"
import { submitForm } from "@/lib/form/flush"
import { getFieldError } from "@/lib/form/formContext"
import { useAppForm } from "@/lib/form/useAppForm"
import { getRelationID } from "@/lib/payload/getRelationID"
import { Routes } from "@/lib/routes"
import type { Member } from "@/payload/payload-types"
import { ChipSelect } from "./ChipSelect/ChipSelect"

const LINK_NAMES = Object.keys(links) as LinkName[]
const LINK_OPTIONS = LINK_NAMES.map((value) => ({ label: links[value].name, value }))

const SAVE_ERROR_MESSAGES: Record<Extract<EditMemberResult, { ok: false }>["error"], string> = {
  invalid: "Fix the highlighted fields",
  "username-taken": "That username is taken. Try another.",
  unauthenticated: "Sign in again to save",
  unavailable: "We could not check your session. Try again.",
  server: "Something went wrong. Try again.",
}

export interface EditProfileFormProps {
  /**
   * The signed-in member, whose profile gives the starting values
   */
  member: Member
}

/**
 * The "Edit Profile" form for the member's playground profile
 */
export const EditProfileForm = ({ member }: EditProfileFormProps) => {
  const router = useRouter()
  const pictureInput = useRef<HTMLInputElement>(null)
  // Remounts the upload field on Remove, as it keeps showing the picture it uploaded
  const [pictureKey, setPictureKey] = useState(0)
  const savedPictureURL =
    (typeof member.profilePicture === "object" && member.profilePicture?.url) || undefined

  const defaultValues: EditMemberInput = {
    username: member.username,
    profilePicture: member.profilePicture ? getRelationID(member.profilePicture) : null,
    bio: member.bio ?? "",
    skills: member.skills ?? [],
    // Only the editable fields, as each saved row also has a Payload `id`
    links: member.links?.map(({ name, url }) => ({ name, url })) ?? [],
  }

  const form = useAppForm({
    defaultValues,
    // Checks on submit, then on every change once the member has tried to submit
    validationLogic: revalidateLogic(),
    validators: { onDynamic: editMemberSchema },
    onSubmit: async ({ value }) => {
      try {
        const result = await editMember(value)
        if (!result.ok) {
          toast.error({ description: SAVE_ERROR_MESSAGES[result.error] })
          return
        }
        toast.success({ description: "Profile updated" })
      } catch (error) {
        console.error("[EditProfileForm] Failed to save the profile", { error })
        toast.error({ description: SAVE_ERROR_MESSAGES.server })
      }
    },
  })

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submitForm(form)
      }}
    >
      <p className="font-mono">
        {/** biome-ignore lint/suspicious/noCommentText: the // is not for a comment */}
        <span className="text-primary">// </span>EDIT PROFILE
      </p>

      <form.AppField name="profilePicture">
        {(field) => (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <field.ImageUploadField
              className="aspect-square rounded-sm"
              containerClassName="w-24 shrink-0"
              key={pictureKey}
              label="Profile picture"
              maxBytes={MEDIA_MAX_BYTES}
              maxDimension={MEDIA_UPLOAD_MAX_DIMENSION}
              ref={pictureInput}
              src={field.state.value ? savedPictureURL : undefined}
              types={MEDIA_TYPES}
              upload={uploadProfilePicture}
            />
            <div className="flex gap-3">
              <Button
                className="border border-gray-300 bg-white text-base"
                onClick={() => pictureInput.current?.click()}
                shape="pill"
                size="md"
                theme="ghost"
              >
                Upload new photo
              </Button>
              <Button
                className="text-base"
                disabled={!field.state.value}
                onClick={() => {
                  field.handleChange(null)
                  setPictureKey((key) => key + 1)
                }}
                shape="pill"
                size="md"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </form.AppField>

      <form.AppField name="username">
        {(field) => <field.TextField className="bg-white font-sans" label="Username" />}
      </form.AppField>

      <form.AppField name="bio">
        {(field) => (
          <field.TextAreaField
            className="min-h-32 bg-white p-4 font-sans"
            label="Bio"
            placeholder="Tell people a bit about yourself"
          />
        )}
      </form.AppField>

      <form.Field name="skills">
        {(field) => (
          <ChipSelect
            addLabel="Add a skill"
            error={getFieldError(field.state.meta.errors)}
            label="Skills"
            onChange={field.handleChange}
            options={skills}
            value={field.state.value}
          />
        )}
      </form.Field>

      <form.Field name="links">
        {(linksField) => {
          const unusedLinkName = LINK_NAMES.find(
            (name) => !linksField.state.value.some((row) => row.name === name),
          )
          return (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-medium font-mono text-gray-700 text-sm">Links</legend>
              {linksField.state.value.map((row, index) => {
                const link = links[row.name]
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id, and each input reads its value from the form, so index keys stay in sync
                  <div className="flex items-start gap-2" key={index}>
                    <div className="w-32 shrink-0 sm:w-44">
                      <form.Field name={`links[${index}].name`}>
                        {(field) => (
                          <Select
                            error={getFieldError(field.state.meta.errors)}
                            onChange={(value) => field.handleChange(value as LinkName)}
                            options={LINK_OPTIONS}
                            value={field.state.value}
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="min-w-0 flex-1">
                      <form.AppField name={`links[${index}].url`}>
                        {(field) => (
                          <field.TextField
                            aria-label={`${link.name} URL`}
                            className="min-h-11 bg-white font-sans text-sm"
                            placeholder={link.url}
                            type="url"
                          />
                        )}
                      </form.AppField>
                    </div>
                    <Button
                      aria-label={`Remove ${link.name} link`}
                      className="size-11"
                      onClick={() => linksField.removeValue(index)}
                      size="icon"
                      theme="ghost"
                    >
                      <XMarkIcon className="size-5" />
                    </Button>
                  </div>
                )
              })}
              {/* Each link type can be added once, so the button goes once every type is used */}
              {unusedLinkName && (
                <Button
                  className="font-normal text-gray-500 text-xs"
                  left={<PlusIcon className="size-4 text-black" />}
                  onClick={() => linksField.pushValue({ name: unusedLinkName, url: "" })}
                  theme="ghost"
                >
                  Add a link
                </Button>
              )}
            </fieldset>
          )
        }}
      </form.Field>

      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton theme="dark">Update</form.SubmitButton>
        </form.AppForm>
        {/* The profile route, as a saved username change moves the profile's URL */}
        <Button onClick={() => router.push(Routes.PROFILE.ROOT)} theme="ghost">
          Back
        </Button>
      </div>
    </form>
  )
}
