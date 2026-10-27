import { createFormHookContexts } from "@tanstack/react-form"

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

/**
 * The first error to show for a field. Server errors are strings, and validator errors can be
 * objects with a `message`.
 */
export const getFieldError = (errors: unknown[]): string | undefined => {
  const [error] = errors
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) return String(error.message)
  return undefined
}
