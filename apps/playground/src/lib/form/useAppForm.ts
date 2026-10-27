import { createFormHook } from "@tanstack/react-form"
import { SubmitButton } from "./components/SubmitButton"
import { ImageUploadField } from "./fields/ImageUploadField"
import { RichTextField } from "./fields/RichTextField"
import { TextAreaField } from "./fields/TextAreaField"
import { TextField } from "./fields/TextField"
import { fieldContext, formContext } from "./formContext"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextAreaField, ImageUploadField, RichTextField },
  formComponents: { SubmitButton },
})
