"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../../utils"

export interface PinInputProps {
  value: string
  onChange: (value: string) => void
  label: string
  error: string | undefined
  length?: number
  required?: boolean
  disabled?: boolean
  containerClassName?: string
}

const SLOT_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"]

export const PinInput = ({
  value,
  onChange,
  label,
  error,
  length = 6,
  required,
  disabled,
  containerClassName,
}: PinInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null))

  const [slots, setSlots] = useState<string[]>(() =>
    value.split("").concat(Array(length).fill("")).slice(0, length),
  )
  const slotsRef = useRef(slots)

  useEffect(() => {
    if (value === "") {
      const cleared = Array(length).fill("")
      slotsRef.current = cleared
      setSlots(cleared)
    }
  }, [value, length])

  const commit = (next: string[]) => {
    slotsRef.current = next
    setSlots(next)
    onChange(next.join(""))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.ctrlKey || e.metaKey) return

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault()
      const next = [...slots]
      next[i] = e.key
      commit(next)
      if (i < length - 1) inputRefs.current[i + 1]?.focus()
    } else if (e.key === "Backspace") {
      e.preventDefault()
      const next = [...slots]
      if (next[i]) {
        next[i] = ""
        commit(next)
      } else if (i > 0) {
        next[i - 1] = ""
        commit(next)
        inputRefs.current[i - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      if (i > 0) inputRefs.current[i - 1]?.focus()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      if (i < length - 1) inputRefs.current[i + 1]?.focus()
    } else if (e.key.length === 1 && !(e.key >= "0" && e.key <= "9")) {
      // Only block real single-char non-digit keys (letters/symbols). Multi-char
      // key reports (Enter, Tab, and IME-composed "Unidentified"/"Process" from
      // some Android keyboards) fall through to native input / handleChange.
      e.preventDefault()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const raw = e.target.value

    if (raw === "") {
      if (slotsRef.current[i]) {
        const next = [...slotsRef.current]
        next[i] = ""
        commit(next)
      }
      return
    }

    const digits = raw.replace(/\D/g, "")

    if (digits.length === 0) {
      commit([...slotsRef.current])
      return
    }

    if (digits.length > 1) {
      // Multi-char value in a single slot (autofill/dictation) - replace the whole code from slot 0, same as handlePaste
      const clipped = digits.slice(0, length)
      const next = clipped.split("").concat(Array(length).fill("")).slice(0, length)
      commit(next)
      inputRefs.current[Math.min(clipped.length, length - 1)]?.focus()
      return
    }

    const next = [...slotsRef.current]
    next[i] = digits
    commit(next)
    if (i < length - 1) inputRefs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)

    if (raw.length === 0) {
      commit([...slotsRef.current])
      return
    }

    const next = raw.split("").concat(Array(length).fill("")).slice(0, length)
    commit(next)
    inputRefs.current[Math.min(raw.length, length - 1)]?.focus()
  }

  return (
    <div className={cn("flex w-full flex-col justify-start gap-1 font-mono", containerClassName)}>
      <label className="block text-sm font-medium text-gray-700" htmlFor={label}>
        {label}
        {required && <span className="ml-1 text-brand-pink">*</span>}
      </label>

      <div className="flex gap-2">
        {slots.map((digit, i) => (
          <input
            aria-invalid={!!error}
            aria-label={`Digit ${i + 1} of ${length}`}
            autoComplete="one-time-code"
            className={cn(
              "h-12 w-12 rounded border text-center font-mono text-lg caret-transparent transition-colors focus:ring-1 focus:outline-none",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : digit
                  ? "border-gray-400 focus:border-primary focus:ring-primary"
                  : "border-gray-300 focus:border-primary focus:ring-primary",
            )}
            disabled={disabled}
            id={i === 0 ? label : undefined}
            inputMode="numeric"
            key={SLOT_KEYS[i]}
            maxLength={1}
            onChange={(e) => handleChange(e, i)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            pattern="[0-9]*"
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            value={digit}
          />
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
