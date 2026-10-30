import { cn } from "../../utils"

export interface InputProps extends React.ComponentPropsWithRef<"input"> {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

export const Input = ({
  label,
  hint,
  error,
  containerClassName,
  className,
  required,
  ref,
  ...props
}: InputProps) => {
  const errorMessage = error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null

  if (!label) {
    return (
      <>
        {hint && <p className="paragraph-xs -mt-1 text-gray-400">{hint}</p>}
        <input
          className={cn("w-full rounded border border-gray-300 px-3 py-2", className)}
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
      <label className="block text-sm font-medium text-gray-700" htmlFor={label}>
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </label>
      {hint && <p className="paragraph-xs -mt-1 text-gray-400">{hint}</p>}
      <input
        className={cn("w-full rounded border border-gray-300 px-3 py-2", className)}
        id={label}
        ref={ref}
        required={required}
        {...props}
      />
      {errorMessage}
    </div>
  )
}
