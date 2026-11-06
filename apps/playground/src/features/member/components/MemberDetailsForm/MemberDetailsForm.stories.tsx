import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { Member } from "@uoacs/shared/payload"
import { MemberDetailsForm } from "./MemberDetailsForm"

const member: Member = {
  id: "member-1",
  firstName: "Aroha",
  lastName: "Smith",
  email: "aroha@aucklanduni.ac.nz",
  upi: "asmi123",
  uoaID: "123456789",
  gender: "Prefer not to say",
  phoneNumber: "021 000 0000",
  compsciStudent: true,
  otherMajors: ["Mathematics"],
  studyYear: "second-year",
  heardAboutUs: "Friend",
  eventWishList: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const meta: Meta<typeof MemberDetailsForm> = {
  title: "Member/MemberDetailsForm",
  component: MemberDetailsForm,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    member,
    onSave: async () => ({ ok: true }),
  },
}

export default meta
type Story = StoryObj<typeof MemberDetailsForm>

export const Default: Story = {}

export const FieldError: Story = {
  args: {
    onSave: async () => ({
      ok: false,
      message: "Validation failed",
      fieldErrors: [{ field: "upi", message: "This UPI is already in use" }],
    }),
  },
}

export const SaveFails: Story = {
  args: {
    onSave: async () => ({
      ok: false,
      message: "An error occurred while updating your profile",
    }),
  },
}
