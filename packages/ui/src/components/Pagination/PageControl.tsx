import Link from "next/link"

/**
 * Props for the {@link PageControl} component.
 */
export interface PageControlProps {
  /**
   * The page this control navigates to.
   */
  target: number
  /**
   * An accessible label for the control, e.g. "Page 3" or "Next page".
   */
  label: string
  className: string
  /**
   * Whether the control is unavailable, e.g. the previous arrow on the first page.
   */
  disabled?: boolean
  /**
   * Whether this control is the current page.
   */
  current?: boolean
  /**
   * Builds the URL for a page. When given, the control renders as a link.
   */
  getHref?: (page: number) => string
  /**
   * Fully prefetch the linked page instead of only the route's shell. Link mode only.
   */
  prefetch?: boolean
  /**
   * Called with the target page. Used when `getHref` isn't given, rendering a button.
   */
  onPageChange?: (page: number) => void
  children: React.ReactNode
}

/**
 * A single pagination control used within the {@link Pagination} component, rendered as a link
 * or a button depending on the mode.
 *
 * @param props {@link PageControlProps} for the PageControl component.
 * @returns A link, button, or inert placeholder for a disabled link.
 */
export const PageControl = ({
  target,
  label,
  className,
  disabled,
  current,
  getHref,
  prefetch,
  onPageChange,
  children,
}: PageControlProps) => {
  const ariaCurrent = current ? "page" : undefined

  if (getHref) {
    // Links can't be disabled, so an unavailable arrow is shown but hidden from assistive tech
    if (disabled) {
      return (
        <span aria-hidden="true" className={className}>
          {children}
        </span>
      )
    }
    return (
      <Link
        aria-current={ariaCurrent}
        aria-label={label}
        className={className}
        href={getHref(target)}
        // Undefined keeps the default prefetch
        prefetch={prefetch || undefined}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      aria-current={ariaCurrent}
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={() => {
        if (!current) onPageChange?.(target)
      }}
      type="button"
    >
      {children}
    </button>
  )
}
