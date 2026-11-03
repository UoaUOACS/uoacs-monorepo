"use client"

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Input } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { useImperativeHandle, useRef } from "react"

/**
 * Props for the {@link SearchBar} component.
 *
 * Extends the native `<input>` props, so anything an input accepts (`name`,
 * `value`, `defaultValue`, `onKeyDown`, ...) is passed straight through.
 */
export interface SearchBarProps extends Omit<React.ComponentPropsWithRef<"input">, "type"> {
  /**
   * Additional class names for the wrapping element.
   */
  containerClassName?: string
  /**
   * Called with the current text whenever the user types or clears the field.
   * Runs after `onChange`.
   */
  onValueChange?: (value: string) => void
}

/**
 * The Project Playground search control: a white pill-shaped text field with a
 * leading magnifying glass and a trailing button that clears the field once
 * there is text. Slightly smaller below the `md` breakpoint.
 *
 * Works controlled (`value` + `onChange`/`onValueChange`) or uncontrolled
 * (`defaultValue`). Actually querying projects is out of scope.
 *
 * @param containerClassName Additional class names for the wrapping element.
 * @param onValueChange Called with the current text whenever it changes.
 * @returns The search control.
 * @example
 * <SearchBar onValueChange={setQuery} />
 */
export const SearchBar = ({
  containerClassName,
  className,
  onChange,
  onValueChange,
  placeholder = "Search",
  disabled,
  readOnly,
  "aria-label": ariaLabel = "Search",
  ref,
  ...props
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Callers still get the real <input> through `ref`; we keep our own handle
  // so the clear button can reach it.
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const handleClear = () => {
    const input = inputRef.current
    if (!input) return

    // Writing through the native setter and firing a real "input" event makes
    // React run onChange exactly as if the user had deleted the text, so
    // clearing works the same for controlled and uncontrolled usage (and for
    // form libraries that listen to onChange).
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    setNativeValue?.call(input, "")
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.focus()
  }

  return (
    <search className={cn("relative w-full", containerClassName)}>
      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-black md:left-6 md:size-6"
      />
      <Input
        {...props}
        aria-label={ariaLabel}
        className={cn(
          // `peer` lets the clear button below react to this input's state.
          "peer h-14 rounded-3xl border-0 bg-white px-14 font-switzer text-base text-black shadow-lg placeholder:text-gray-800 focus:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 md:h-16 md:px-16 md:text-lg [&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        disabled={disabled}
        onChange={handleChange}
        // :placeholder-shown (which hides the clear button when the field is
        // empty) only matches inputs that have a placeholder, so never pass "".
        placeholder={placeholder || " "}
        readOnly={readOnly}
        ref={inputRef}
        type="search"
      />
      <button
        aria-label="Clear search"
        className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors peer-placeholder-shown:hidden hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 md:right-3"
        disabled={disabled || readOnly}
        onClick={handleClear}
        type="button"
      >
        <XMarkIcon aria-hidden="true" className="size-4 md:size-5" />
      </button>
    </search>
  )
}
