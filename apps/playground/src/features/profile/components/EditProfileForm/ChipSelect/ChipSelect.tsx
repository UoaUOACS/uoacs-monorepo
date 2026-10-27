import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Button, Dropdown } from "@uoacs/ui"

export interface ChipSelectProps<T extends string> {
  label: string
  /**
   * The text of the add button, e.g. "Add a skill".
   */
  addLabel: string
  options: readonly T[]
  value: T[]
  onChange: (value: T[]) => void
  error?: string
}

/**
 * The picked values as removable chips, followed by a dropdown to add any of the rest.
 */
export const ChipSelect = <T extends string>({
  label,
  addLabel,
  options,
  value,
  onChange,
  error,
}: ChipSelectProps<T>) => {
  const unpicked = options.filter((option) => !value.includes(option))

  return (
    <fieldset>
      <legend className="mb-2 font-medium font-mono text-gray-700 text-sm">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((item) => (
          <span
            className="flex items-center gap-1 rounded-sm border border-gray-300 bg-white py-1 pr-1 pl-3 text-sm"
            key={item}
          >
            {item}
            <Button
              aria-label={`Remove ${item}`}
              className="size-6 p-1"
              onClick={() => onChange(value.filter((other) => other !== item))}
              size="icon"
              theme="ghost"
            >
              <XMarkIcon className="size-4" />
            </Button>
          </span>
        ))}
        {unpicked.length > 0 && (
          <Dropdown
            fast
            label={
              <span className="flex items-center gap-1.5 font-normal text-gray-500 text-xs">
                <PlusIcon className="size-4 text-black" />
                {addLabel}
              </span>
            }
            options={unpicked.map((option) => ({
              label: option,
              onClick: () => onChange([...value, option]),
              theme: "ghost",
              className: "w-full justify-start rounded-none font-normal text-sm",
            }))}
            popoverClassName="right-auto left-0 z-30 max-h-72 w-56 items-stretch gap-0 overflow-y-auto rounded-sm border border-gray-200 bg-white py-1 shadow-md"
            theme="ghost"
            trigger={false}
          />
        )}
      </div>
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </fieldset>
  )
}
