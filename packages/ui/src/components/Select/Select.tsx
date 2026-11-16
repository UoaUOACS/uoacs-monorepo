"use client"

import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { AnimatePresence, motion } from "motion/react"
import { type Ref, useEffect, useRef, useState } from "react"
import { usePopoverKeyboardNav } from "../../hooks/usePopoverKeyboardNav"
import { cn } from "../../utils"

export type SelectOption = string | { label: string; value: string }

export interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  containerClassName?: string
  required?: boolean
  placeholder?: string
  ref?: Ref<HTMLButtonElement>
}

export const Select = ({
  label,
  error,
  options,
  value,
  onChange,
  containerClassName,
  required,
  placeholder = "Select an option",
  ref,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  const onKeyDown = usePopoverKeyboardNav({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef,
    itemRefs: optionRefs,
  })

  useEffect(() => {
    if (isOpen) triggerRef.current?.focus()
  }, [isOpen])

  const normalize = (option: SelectOption) =>
    typeof option === "string" ? { label: option, value: option } : option

  const selectedLabel = options.map(normalize).find((o) => o.value === value)?.label

  const select = (val: string) => {
    onChange(val)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const selectControl = (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegates keydown from the trigger/options below to the shared popover nav handler
    <div className="relative" onKeyDown={onKeyDown}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex min-h-11 w-full items-center rounded border border-gray-300 px-3 py-2 text-left text-sm"
        id={label || undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        ref={(el) => {
          triggerRef.current = el
          if (typeof ref === "function") ref(el)
          else if (ref) ref.current = el
        }}
        type="button"
      >
        <span className={cn("flex-1", !value && "text-gray-400")}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-gray-700 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full z-10 mt-1 w-full rounded border border-gray-200 bg-white py-2 shadow-md"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            role="listbox"
            transition={{ damping: 25, stiffness: 400, type: "spring" }}
          >
            {options.map(normalize).map(({ label: optLabel, value: optValue }, i) => (
              <li key={optValue}>
                <button
                  aria-selected={optValue === value}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm transition-colors duration-300 hover:bg-gray-400-opaque",
                    optValue === value && "pointer-events-none bg-primary font-medium text-white",
                  )}
                  onClick={() => select(optValue)}
                  ref={(el) => {
                    optionRefs.current[i] = el
                  }}
                  role="option"
                  type="button"
                >
                  {optLabel}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )

  const errorMessage = error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null

  if (!label) {
    return (
      <div ref={containerRef}>
        {selectControl}
        {errorMessage}
      </div>
    )
  }

  return (
    <div
      className={cn("flex w-full flex-col justify-start gap-1 font-mono", containerClassName)}
      ref={containerRef}
    >
      <label className="text-sm font-medium text-gray-700" htmlFor={label}>
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </label>
      {selectControl}
      {errorMessage}
    </div>
  )
}
