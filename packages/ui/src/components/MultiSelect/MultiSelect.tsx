"use client"

import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { AnimatePresence, motion } from "motion/react"
import { type Ref, useEffect, useRef, useState } from "react"
import { usePopoverKeyboardNav } from "../../hooks/usePopoverKeyboardNav"
import { cn } from "../../utils"
import { Button } from "../Button/Button"

interface MultiSelectProps {
  label?: string
  error?: string
  options: string[]
  value: string[]
  onChange: (values: string[]) => void
  customTextInput?: boolean
  containerClassName?: string
  required?: boolean
  placeholder?: string
  ref?: Ref<HTMLDivElement>
}

export const MultiSelect = ({
  label,
  error,
  options,
  value,
  onChange,
  containerClassName,
  required,
  customTextInput = false,
  placeholder = "Select options",
  ref,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
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

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const multiSelectControl = (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegates keydown from the trigger/options below to the shared popover nav handler
    <div className="relative" onKeyDown={onKeyDown}>
      {/* biome-ignore lint/a11y/useSemanticElements: can't be a <button> since it contains real nested <button> chip-remove controls */}
      <div
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded border border-gray-300 px-3 py-2 text-left"
        id={label || undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
        ref={(el) => {
          triggerRef.current = el
          if (typeof ref === "function") ref(el)
          else if (ref) ref.current = el
        }}
        role="button"
        tabIndex={0}
      >
        {value.length === 0 ? (
          <span className="text-sm text-gray-400">{placeholder}</span>
        ) : (
          value.map((v) => (
            <span
              className="flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-sm text-white"
              key={v}
            >
              {v}
              <button
                aria-label={`Remove ${v}`}
                className="flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(v)
                }}
                type="button"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))
        )}
        <ChevronDownIcon
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-gray-700 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            animate={{ opacity: 1, y: 0 }}
            aria-multiselectable="true"
            className="absolute top-full z-10 mt-1 w-full rounded border border-gray-200 bg-white py-2 shadow-md"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            role="listbox"
            transition={{ damping: 25, stiffness: 400, type: "spring" }}
          >
            {options.map((option, i) => {
              const checked = value.includes(option)
              return (
                <li key={option}>
                  <button
                    aria-selected={checked}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-300 hover:bg-gray-400-opaque"
                    onClick={() => toggle(option)}
                    ref={(el) => {
                      optionRefs.current[i] = el
                    }}
                    role="option"
                    type="button"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked ? "border-brand-pink bg-brand-pink" : "border-gray-300",
                      )}
                    >
                      {checked && (
                        <svg
                          aria-hidden="true"
                          className="h-2.5 w-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 12 12"
                        >
                          <path d="M1.5 6l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {option}
                  </button>
                </li>
              )
            })}
            {customTextInput && (
              <li className="flex flex-row items-center gap-2 border-t border-gray-200 py-2 pr-2">
                <input
                  className="w-full border-0 px-3 py-2 text-sm focus:ring-0"
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customValue.trim() !== "") {
                      e.preventDefault()
                      if (!value.includes(customValue.trim())) {
                        onChange([...value, customValue.trim()])
                      }
                      setCustomValue("")
                    }
                  }}
                  placeholder="Other option..."
                  type="text"
                  value={customValue}
                />
                <Button
                  onClick={() => {
                    if (customValue.trim() !== "" && !value.includes(customValue.trim())) {
                      onChange([...value, customValue.trim()])
                    }
                    setCustomValue("")
                  }}
                  theme="ghost"
                >
                  Add
                </Button>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )

  const errorMessage = error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null

  if (!label) {
    return (
      <div ref={containerRef}>
        {multiSelectControl}
        {errorMessage}
      </div>
    )
  }

  return (
    <div
      className={cn("flex w-full flex-col justify-start gap-1 font-mono", containerClassName)}
      ref={containerRef}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only refocuses the already keyboard-operable trigger div, not itself an interactive target */}
      <label
        className="text-sm font-medium text-gray-700"
        htmlFor={label}
        onClick={() => triggerRef.current?.focus()}
      >
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </label>
      {multiSelectControl}
      {errorMessage}
    </div>
  )
}
