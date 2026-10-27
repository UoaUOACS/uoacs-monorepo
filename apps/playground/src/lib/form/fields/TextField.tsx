"use client"

import { Input, type InputProps } from "@uoacs/ui"
import { getFieldError, useFieldContext } from "../formContext"

export type TextFieldProps = Omit<InputProps, "name" | "value" | "onChange" | "onBlur" | "error">

/**
 * Shows a live character count as the hint when `maxLength` is set and no hint is given
 */
export const TextField = ({ hint, maxLength, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>()
  const value = field.state.value
  return (
    <Input
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
