"use client"

import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { AnimatePresence, motion, stagger } from "motion/react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { usePopoverKeyboardNav } from "../../hooks/usePopoverKeyboardNav"
import { cn } from "../../utils"
import { Button } from "../Button/Button"
import type { ButtonVariantProps } from "../Button/variants"
import { DropdownOption, type DropdownOptionProps } from "./DropdownOption"

/**
 * Props for the {@link Dropdown} component.
 */
export interface DropdownProps extends ButtonVariantProps {
  /**
   * A label for the dropdown button.
   */
  label: string | ReactNode
  /**
   * Whether the dropdown button is disabled. A disabled dropdown closes and cannot open.
   */
  disabled?: boolean
  /**
   * Whether the options animate in and out quickly, with no stagger.
   */
  fast?: boolean
  /**
   * Whether a mouse click on the dropdown leaves focus where it is, such as in a text editor.
   * Keyboard users can still tab to the trigger to use the menu.
   */
  keepFocus?: boolean
  /**
   * Options for the dropdown menu.
   */
  options: DropdownOptionProps[]
  /**
   * Additional class names for the popover container.
   */
  popoverClassName?: string
  /**
   * Trigger button configuration, or `false` to hide the trigger icon entirely.
   * Omit for default triangle icon.
   */
  trigger?: false | { triggerClassName?: string; triggerIcon?: ReactNode }
}

/**
 * A primitive Dropdown component that provides a button to toggle a list of options.
 *
 * @param props {@link DropdownProps} for the Dropdown component.
 * @returns A styled dropdown element.
 */
export const Dropdown = ({
  label,
  disabled = false,
  fast = false,
  keepFocus = false,
  options,
  popoverClassName,
  trigger,
  ...buttonVariantProps
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [])

  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  const onKeyDown = usePopoverKeyboardNav({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef,
    itemRefs: optionRefs,
  })

  useEffect(() => {
    if (isOpen && !keepFocus) triggerRef.current?.focus()
  }, [isOpen, keepFocus])

  const triggerClassName = trigger !== false ? trigger?.triggerClassName : undefined
  const triggerRight =
    trigger === false
      ? undefined
      : (trigger?.triggerIcon ?? (
          <ChevronDownIcon className={cn("h-4 w-4", isOpen && "rotate-180")} />
        ))

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegates keydown from the trigger/menu items below to the shared popover nav handler, and mousedown to keep focus
    <div
      // Raised while open, so the menu covers other dropdown triggers below it
      className={cn("relative inline-flex", isOpen && "z-30")}
      onKeyDown={onKeyDown}
      onMouseDown={keepFocus ? (event) => event.preventDefault() : undefined}
      ref={ref}
    >
      <Button
        aria-expanded={isOpen}
        className={cn("z-20", triggerClassName)}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        ref={triggerRef}
        right={triggerRight}
        {...buttonVariantProps}
      >
        {label}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate="open"
            className={cn(
              "absolute top-full right-0 z-5 mt-2 flex origin-top flex-col items-end gap-2 rounded-2xl",
              popoverClassName,
            )}
            exit="closed"
            initial="closed"
            role="menu"
            transition={
              fast
                ? { duration: 0.1, ease: "easeOut" }
                : {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.15,
                    delayChildren: stagger(0.05),
                  }
            }
            variants={{
              open: { opacity: 1, y: 0 },
              closed: { opacity: 0, y: -5 },
            }}
          >
            {options.map((option, i) => (
              <motion.div
                key={option.href ?? option.label?.toString()}
                transition={fast ? { duration: 0.1, ease: "easeOut" } : undefined}
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: -5 },
                }}
              >
                <DropdownOption
                  {...option}
                  onClick={() => {
                    option.onClick?.()
                    setIsOpen(false)
                  }}
                  ref={(el) => {
                    optionRefs.current[i] = el
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
