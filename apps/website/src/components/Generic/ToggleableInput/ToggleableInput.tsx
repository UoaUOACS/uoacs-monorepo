"use client"

import { LockClosedIcon } from "@heroicons/react/24/solid"
import { Button } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

export interface ToggleableProps {
  label: string
  required?: boolean
  error?: string
  containerClassName?: string
  displayNode: React.ReactNode
  onSave?: () => void | Promise<void>
  onCancel?: () => void
  defaultToggleState?: boolean
  locked?: boolean
  lockedReason?: string
  children: React.ReactNode
}

export const ToggleableInput = ({
  label,
  required,
  error,
  containerClassName,
  displayNode,
  onSave,
  onCancel,
  defaultToggleState = false,
  locked = false,
  lockedReason,
  children,
}: ToggleableProps) => {
  const [isEditable, setIsEditable] = useState<boolean>(defaultToggleState)
  const [isSaving, setIsSaving] = useState(false)

  return (
    <div
      className={cn(
        "group flex w-full flex-col justify-start gap-2 font-mono",
        !isEditable && "border-b-2 border-gray-300",
        containerClassName,
      )}
    >
      <div className="flex flex-row justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-brand-pink">*</span>}
          {locked && (
            <span className="cursor-default" title={lockedReason}>
              <LockClosedIcon
                aria-label="This field cannot be edited"
                className="h-3.5 w-3.5 text-gray-400"
              />
            </span>
          )}
        </span>
        <div className="relative">
          {locked ? null : (
            <>
              {!isEditable && (
                <div className="opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                  <Button
                    aria-label={`Edit ${label}`}
                    className="h-auto px-2 py-1 text-xs leading-none md:h-auto"
                    onClick={() => setIsEditable(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
              <AnimatePresence>
                {isEditable && (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute top-0 right-0"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex flex-row gap-2">
                      <Button
                        className="h-auto px-2 py-1 text-xs leading-none md:h-auto"
                        onClick={() => {
                          onCancel?.()
                          setIsEditable(false)
                        }}
                        theme="ghost"
                      >
                        Close
                      </Button>
                      <Button
                        className="h-auto px-2 py-1 text-xs leading-none md:h-auto"
                        disabled={isSaving}
                        onClick={async () => {
                          setIsSaving(true)
                          try {
                            await onSave?.()
                            setIsEditable(false)
                          } catch (err) {
                            console.error("[ToggleableInput] onSave failed", { label, error: err })
                          } finally {
                            setIsSaving(false)
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      {locked || !isEditable ? (
        typeof displayNode === "string" ? (
          <p className="text-paragraph min-h-9 py-2 text-left text-gray-600">{displayNode}</p>
        ) : (
          <div className="min-h-9">{displayNode}</div>
        )
      ) : (
        children
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
