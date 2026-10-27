import { z } from "zod"
import type { Member } from "../payload-types"

export const genderSchema = z.enum(["Male", "Female", "Non-binary", "Other", "Prefer not to say"], {
  error: "Please select a gender",
})

/**
 * Shared because the website validates these as form input and the auth
 * service validates the same fields again as API input. One definition keeps
 * the two from drifting into accepting different things.
 */
export const memberSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  upi: z.string().min(1, "UPI is required"),
  email: z.email({ error: "Please enter a valid email" }),
  uoaID: z.string().min(1, "UOA ID is required"),
  gender: genderSchema,
  phoneNumber: z.string().nullable().optional(),
  compsciStudent: z.boolean({
    error: "Please indicate whether you are a computer science student",
  }),
  otherMajors: z.array(z.string()).nullable().optional(),
  studyYear: z.enum(
    ["first-year", "second-year", "third-year", "fourth-year", "fifth-year-or-above"],
    {
      error: "Please select a year of study",
    },
  ),
  heardAboutUs: z.string().min(1, "This field is required"),
  eventWishList: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Member>

export const createMemberSchema = memberSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .superRefine((data, ctx) => {
    if (!data.compsciStudent && (!data.otherMajors || data.otherMajors.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your major(s)",
        path: ["otherMajors"],
      })
    }
  })

export type CreateMemberInput = z.infer<typeof createMemberSchema>

export const updateMemberSchema = memberSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    email: true,
  })
  .partial()

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
