"use client"

import { TextArea, type TextAreaProps } from "@uoacs/ui"
import { getFieldError, useFieldContext } from "../formContext"

export type TextAreaFieldProps = Omit<
  TextAreaProps,
  "name" | "value" | "onChange" | "onBlur" | "error"
>

/**
 * Shows a live character count as the hint when `maxLength` is set and no hint is given
 */
export const TextAreaField = ({ hint, maxLength, ...props }: TextAreaFieldProps) => {
  const field = useFieldContext<string>()
  const value = field.state.value
  return (
    <TextArea
      {...props}
      error={getFieldError(field.state.meta.errors)}
      hint={hint ?? (maxLength ? `${value.length}/${maxLength}` : undefined)}
      maxLength={maxLength}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      value={value}
    />
  )
}
