"use client"

import { Button, type ButtonProps } from "@uoacs/ui"
import { useIsUploading } from "../flush"
import { useFormContext } from "../formContext"

export type SubmitButtonProps = Omit<ButtonProps, "type">

export const SubmitButton = ({ disabled, ...props }: SubmitButtonProps) => {
  const form = useFormContext()
  // A save during an upload would wait for it, so make that clear
  const isUploading = useIsUploading(form)
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          aria-busy={isSubmitting || undefined}
          disabled={disabled || !canSubmit || isSubmitting || isUploading}
          type="submit"
        />
      )}
    </form.Subscribe>
  )
}
