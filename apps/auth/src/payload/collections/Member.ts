import { AuthCollectionSlugs } from "@uoacs/shared"
import { genderSchema } from "@uoacs/shared/payload"
import type { CollectionConfig } from "payload"

export const Member: CollectionConfig = {
  slug: AuthCollectionSlugs.MEMBER,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "betterAuthUserId",
      type: "text",
      required: false,
      unique: true,
      admin: {
        description: "ID of the corresponding user authentication in Better Auth, if any",
        readOnly: true,
      },
    },
    {
      name: "firstName",
      type: "text",
      required: true,
      admin: {
        description: "First name of the member",
      },
    },
    {
      name: "lastName",
      type: "text",
      required: true,
      admin: {
        description: "Last name of the member",
      },
    },
    {
      name: "upi",
      type: "text",
      required: true,
      admin: {
        description: "University UPI of the member",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      admin: {
        description: "Email address of the member, either uni or personal",
      },
    },
    {
      name: "uoaID",
      type: "text",
      required: true,
      hooks: {
        beforeChange: [({ value }) => (typeof value === "number" ? String(value) : value)],
      },
      admin: {
        description: "University of Auckland student ID number",
      },
    },
    {
      name: "gender",
      type: "select",
      options: genderSchema.options,
      required: true,
      admin: {
        description: "Gender of the member",
      },
    },
    {
      name: "phoneNumber",
      type: "text",
      required: false,
      admin: {
        description: "Phone number of the member",
      },
    },
    {
      name: "compsciStudent",
      type: "checkbox",
      required: true,
      admin: {
        description: "Whether the member is a computer science student",
      },
    },
    {
      name: "otherMajors",
      type: "text",
      hasMany: true,
      required: false,
      validate: (value, { siblingData }) => {
        const data = siblingData as { compsciStudent?: boolean }
        const majors = value as string[] | null | undefined
        if (!data.compsciStudent && (!majors || majors.length === 0)) {
          return "Non-CS members must provide at least one major"
        }
        return true
      },
      admin: {
        description: "Other majors the member is studying, if any",
      },
    },
    {
      name: "studyYear",
      type: "select",
      options: [
        {
          label: "First Year",
          value: "first-year",
        },
        {
          label: "Second Year",
          value: "second-year",
        },
        {
          label: "Third Year",
          value: "third-year",
        },
        {
          label: "Fourth Year",
          value: "fourth-year",
        },
        {
          label: "Fifth Year or Above",
          value: "fifth-year-or-above",
        },
      ],
      required: true,
      admin: {
        description: "Current year of study at university",
      },
    },
    {
      name: "heardAboutUs",
      type: "text",
      required: true,
      admin: {
        description: "How the member heard about UOACS",
      },
    },
    {
      name: "eventWishList",
      type: "text",
      required: false,
      admin: {
        description: "What kinds of events the member would like to see in the future",
      },
    },
  ],
}
