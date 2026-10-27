"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AuthPages } from "@uoacs/shared"
import { genderSchema, memberSchema } from "@uoacs/shared/payload"
import { Button, Input, MultiSelect, Radio, Select } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import type { z as zType } from "zod"
import { z } from "zod"
import { sendVerificationCode, signUp } from "@/actions/sign-up"
import { withRedirect } from "@/lib/redirect"
import type { SignUpStepProps } from "./SignUpForm"
import {
  confirmSession,
  duplicateMessage,
  NO_UNLINKED_MEMBER_MESSAGE,
  SESSION_UNCONFIRMED_MESSAGE,
  UNVERIFIED_MESSAGE,
  UNVERIFIED_REQUEST_CODE_MESSAGE,
} from "./sign-up-result"
import { useSignUpFormStore } from "./stores/SignUpForm.store"

const step2Fields = memberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  firstName: true,
  lastName: true,
  email: true,
})

const step2Schema = step2Fields.superRefine((data, ctx) => {
  if (!data.compsciStudent && (!data.otherMajors || data.otherMajors.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter your major(s)",
      path: ["otherMajors"],
    })
  }
})

type FormInput = zType.input<typeof step2Schema>
type FormOutput = zType.output<typeof step2Schema>

const isFormField = (field: string): field is keyof FormInput => field in step2Fields.shape

export const MemberStep = ({ redirect, returnTo }: SignUpStepProps) => {
  const { step1, step2, setStep2, prevStep, backToVerification, reset } = useSignUpFormStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    reset: resetForm,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(step2Schema),
  })

  useEffect(() => {
    if (step2) resetForm(step2)
  }, [step2, resetForm])

  const isCompsciStudent = watch("compsciStudent")

  const onSubmit = async (step2Data: FormOutput) => {
    if (!step1) {
      toast.error({ description: "Something went wrong. Please start over." })
      reset()
      return
    }
    setStep2(step2Data)
    setLoading(true)
    let leaving = false
    try {
      const result = await signUp({ ...step1, ...step2Data })
      if (!result.ok) {
        if (result.error === "duplicate") {
          if (isFormField(result.field)) setError(result.field, { message: "Already in use" })
          toast.warning({ description: duplicateMessage(result.field) })
        } else if (result.error === "no-unlinked-member") {
          toast.warning({ description: NO_UNLINKED_MEMBER_MESSAGE })
        } else if (result.error === "unverified") {
          // Send a new code first, so the step's "We sent a code" text and cooldown are true.
          const sent = await sendVerificationCode(step1.email).then(
            (r) => r.ok,
            (error) => {
              console.error("[MemberStep] Sending a new code threw", { error })
              return false
            },
          )
          toast.warning({
            description: sent ? UNVERIFIED_MESSAGE : UNVERIFIED_REQUEST_CODE_MESSAGE,
          })
          backToVerification()
        } else {
          toast.error({ description: "An error occurred while submitting the form" })
        }
        return
      }

      if (!(await confirmSession())) {
        toast.error({ description: SESSION_UNCONFIRMED_MESSAGE })
        reset()
        router.push(withRedirect(AuthPages.LOGIN, redirect))
        return
      }
      leaving = true
      window.location.assign(returnTo)
    } catch (error) {
      console.error("[MemberStep] Sign up threw", { error })
      toast.error({
        description:
          "An error occurred while submitting the form. If this keeps happening, refresh the page.",
      })
    } finally {
      if (!leaving) setLoading(false)
    }
  }

  return (
    <form
      className="flex w-full flex-col items-start justify-center gap-4"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="item-center flex w-full flex-col justify-start gap-2 md:flex-row md:gap-4">
        <Input
          {...register("upi")}
          error={errors.upi?.message}
          hint="Not a UOA student? Enter N/A"
          label="UPI"
          required
          type="text"
        />
        <Input
          {...register("uoaID")}
          error={errors.uoaID?.message}
          hint="Not a UOA student? Enter N/A"
          label="UOA ID Number"
          required
          type="text"
        />
      </div>

      <div className="item-center flex w-full flex-col justify-start gap-2 md:flex-row md:gap-4">
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select
              error={errors.gender?.message}
              label="Gender"
              onChange={field.onChange}
              options={genderSchema.options}
              ref={field.ref}
              required
              value={field.value ?? ""}
            />
          )}
        />

        <Input
          {...register("phoneNumber")}
          error={errors.phoneNumber?.message}
          label="Phone Number"
          type="text"
        />
      </div>

      <Controller
        control={control}
        name="compsciStudent"
        render={({ field }) => (
          <Radio
            error={errors.compsciStudent?.message}
            label="Are you a computer science student?"
            onChange={(value) => field.onChange(value === "Yes")}
            options={["Yes", "No"]}
            optionsClassName="flex-row"
            ref={field.ref}
            required
            value={field.value === undefined ? undefined : field.value ? "Yes" : "No"}
          />
        )}
      />

      <div className="item-center flex w-full flex-col justify-start gap-2 md:flex-row md:gap-4">
        <Controller
          control={control}
          name="studyYear"
          render={({ field }) => (
            <Select
              error={errors.studyYear?.message}
              label="Year of Study"
              onChange={field.onChange}
              options={[
                { label: "First Year", value: "first-year" },
                { label: "Second Year", value: "second-year" },
                { label: "Third Year", value: "third-year" },
                { label: "Fourth Year", value: "fourth-year" },
                { label: "Fifth Year or Above", value: "fifth-year-or-above" },
              ]}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="otherMajors"
          render={({ field }) => (
            <MultiSelect
              customTextInput
              error={errors.otherMajors?.message}
              label={isCompsciStudent === true ? "Other Majors (if any)" : "Other Majors"}
              onChange={field.onChange}
              options={[
                "Information and Technology Management",
                "Software Engineering",
                "Information Systems",
                "Mathematics",
              ]}
              ref={field.ref}
              required={isCompsciStudent !== true}
              value={field.value ?? []}
            />
          )}
        />
      </div>

      <Input
        {...register("heardAboutUs")}
        error={errors.heardAboutUs?.message}
        label="How did you hear about us?"
        required
        type="text"
      />

      <Input
        {...register("eventWishList")}
        error={errors.eventWishList?.message}
        label="What kinds of events would you like to see us host?"
        type="text"
      />

      <p className="paragraph-xs text-gray-500">
        By signing up, you agree to our{" "}
        <a
          className="underline transition-colors hover:text-gray-700"
          href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/privacy`}
        >
          Privacy Policy
        </a>
        .
      </p>

      <div className="flex w-full gap-2">
        <Button
          onClick={() => {
            setStep2(getValues())
            prevStep()
          }}
          theme="light"
          type="button"
        >
          Back
        </Button>
        <Button disabled={loading} theme="dark" type="submit">
          {loading ? "Submitting..." : "Sign Up"}
        </Button>
      </div>
    </form>
  )
}
