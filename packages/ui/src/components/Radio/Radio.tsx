"use client"

import { type Ref, useId } from "react"
import { cn } from "../../utils"
import { RadioOption } from "./RadioOption"

export interface RadioProps {
  options: string[]
  label?: string
  error?: string
  containerClassName?: string
  optionsClassName?: string
  required?: boolean
  onChange?: (option: string) => void
  value?: string
  ref?: Ref<HTMLDivElement>
}

export const Radio = ({
  options,
  label,
  error,
  containerClassName,
  optionsClassName,
  required,
  onChange,
  value,
  ref,
}: RadioProps) => {
  const toggle = (option: string) => {
    if (value === option) return
    onChange?.(option)
  }

  const generatedId = useId()
  const errorMessage = error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null

  const radioGroup = (
    <div
      aria-labelledby={label ? `${label}-label` : undefined}
      className={cn("flex flex-col items-start gap-2", optionsClassName)}
      ref={ref}
      role="radiogroup"
    >
      {options.map((option, i) => (
        <RadioOption
          checked={value === option}
          key={option}
          name={label ?? generatedId}
          option={option}
          required={i === 0 ? required : undefined}
          toggle={toggle}
        />
      ))}
    </div>
  )

  if (!label) {
    return (
      <>
        {radioGroup}
        {errorMessage}
      </>
    )
  }

  return (
    <div className={cn("flex w-full flex-col justify-start gap-1 font-mono", containerClassName)}>
      <span className="block text-sm font-medium text-gray-700" id={`${label}-label`}>
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </span>
      {radioGroup}
      {errorMessage}
    </div>
  )
}
