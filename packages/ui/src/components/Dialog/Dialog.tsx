"use client"

import { XMarkIcon } from "@heroicons/react/24/solid"
import { type ReactNode, useEffect, useId, useRef } from "react"
import { cn } from "../../utils"

/**
 * Props for the {@link Dialog} component.
 */
export interface DialogProps {
  /**
   * Whether the dialog is open.
   */
  open: boolean
  /**
   * Called when the dialog requests to close (Escape key, backdrop click or close button).
   */
  onClose: () => void
  /**
   * Title shown at the top of the dialog. Also used as the dialog's accessible name.
   */
  title?: string
  /**
   * Dialog content.
   */
  children: ReactNode
  /**
   * Additional class names for the dialog panel.
   */
  className?: string
}

/**
 * A modal dialog built on the native `<dialog>` element.
 * Provides focus trapping, Escape to close, backdrop click to close and top-layer rendering.
 *
 * @param props {@link DialogProps} for the Dialog component.
 * @returns A styled modal dialog element.
 * @example
 * const [open, setOpen] = useState(false)
 * <Dialog open={open} onClose={() => setOpen(false)} title="Example">Content</Dialog>
 */
export const Dialog = ({ open, onClose, title, children, className }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const pressedBackdrop = useRef(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse shortcut; keyboard users close with Escape, handled natively by <dialog>
    <dialog
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-2xl bg-white p-0 text-black shadow-lg open:flex",
        "opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-out",
        "scale-95 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
        "backdrop:bg-black/0 backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-200",
        "open:backdrop:bg-black/50 starting:open:backdrop:bg-black/0",
        className,
      )}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose()
        pressedBackdrop.current = false
      }}
      onClose={() => {
        if (open) onClose()
      }}
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      ref={ref}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-4">
        {title && (
          <h2 className="text-lg font-medium" id={titleId}>
            {title}
          </h2>
        )}
        <button
          aria-label="Close"
          className="ml-auto cursor-pointer rounded-sm p-1 text-gray-700 transition-colors duration-300 hover:bg-gray-200"
          onClick={onClose}
          type="button"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 pb-6">{children}</div>
    </dialog>
  )
}
