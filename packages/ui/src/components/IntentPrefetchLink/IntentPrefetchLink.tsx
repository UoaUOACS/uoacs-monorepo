"use client"

import Link from "next/link"
import { type ComponentProps, useEffect, useRef, useState } from "react"

// Long enough to skip a cursor passing over, short enough to finish before most clicks
const INTENT_DELAY_MS = 150

/**
 * Props for the {@link IntentPrefetchLink} component. The intent handlers are owned by the link.
 */
export type IntentPrefetchLinkProps = Omit<
  ComponentProps<typeof Link>,
  "prefetch" | "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur" | "onTouchStart"
>

/**
 * A link that fully prefetches its page only once the user shows intent: a short hover or focus,
 * or a touch. Until then it keeps the default prefetch. Use it for grids of links whose pages are
 * cached, where a full prefetch for every visible link would cost too many server requests.
 *
 * @param props {@link IntentPrefetchLinkProps} for the IntentPrefetchLink component.
 * @returns A Next.js link.
 */
export const IntentPrefetchLink = (props: IntentPrefetchLinkProps) => {
  const [intent, setIntent] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const start = () => {
    // Focus and hover can both fire, so drop the earlier timer or cancel can't reach it
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setIntent(true), INTENT_DELAY_MS)
  }
  const cancel = () => clearTimeout(timer.current)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Link
      {...props}
      onBlur={cancel}
      onFocus={start}
      onMouseEnter={start}
      onMouseLeave={cancel}
      onTouchStart={() => setIntent(true)}
      // Undefined keeps the default prefetch until the user shows intent
      prefetch={intent || undefined}
    />
  )
}
