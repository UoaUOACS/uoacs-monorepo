import { useId } from "react"
import { cn } from "../../utils"
import { type TextAreaVariantProps, textAreaVariants } from "./variants"

export interface TextAreaProps
  extends TextAreaVariantProps,
    React.ComponentPropsWithRef<"textarea"> {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

export const TextArea = ({
  label,
  hint,
  error,
  containerClassName,
  className,
  required,
  resize,
  id,
  ref,
  ...props
}: TextAreaProps) => {
  const generatedId = useId()
  const textAreaId = id ?? generatedId
  const errorMessage = error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null
  const textAreaClassName = cn(textAreaVariants({ resize }), className)

  if (!label) {
    return (
      <>
        {hint && <p className="paragraph-xs -mt-1 text-gray-400">{hint}</p>}
        <textarea
          aria-invalid={error ? true : undefined}
          className={textAreaClassName}
          id={id}
          ref={ref}
          required={required}
          {...props}
        />
        {errorMessage}
      </>
    )
  }

  return (
    <div className={cn("flex w-full flex-col justify-start gap-2 font-mono", containerClassName)}>
      <label className="block text-sm font-medium text-gray-700" htmlFor={textAreaId}>
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </label>
      {hint && <p className="paragraph-xs -mt-1 text-gray-400">{hint}</p>}
      <textarea
        aria-invalid={error ? true : undefined}
        className={textAreaClassName}
        id={textAreaId}
        ref={ref}
        required={required}
        {...props}
      />
      {errorMessage}
    </div>
  )
}
