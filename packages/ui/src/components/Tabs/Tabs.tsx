import Link from "next/link"
import { cn } from "../../utils"
import { tabsVariants } from "./Tabs.variants"

/**
 * A single tab in the {@link Tabs} component.
 */
export interface TabOption<TValue extends string> {
  value: TValue
  label: string
  /**
   * Why the tab can't be selected, e.g. "Coming soon". When given, the tab is shown but disabled,
   * and the reason is shown on hover and read by screen readers.
   */
  disabledReason?: string
}

interface TabsBaseProps<TValue extends string> {
  /**
   * The tabs in the order they appear.
   */
  tabs: readonly TabOption<TValue>[]
  activeTab: TValue
  /**
   * An accessible name for the row of tabs.
   */
  "aria-label"?: string
  className?: string
}

interface TabsLinkProps<TValue extends string> extends TabsBaseProps<TValue> {
  /**
   * Builds the URL for a tab, rendering each tab as a link in a navigation landmark.
   */
  getHref: (tab: TValue) => string
  /**
   * Fully prefetch the other tabs, not just the route's shell. Each prefetch costs a server
   * request, so only enable it when the tab data is cached.
   */
  prefetchTabs?: boolean
  onTabChange?: never
  id?: never
}

interface TabsButtonProps<TValue extends string> extends TabsBaseProps<TValue> {
  /**
   * Called with the selected tab, rendering each tab as a button in a tablist.
   */
  onTabChange: (tab: TValue) => void
  /**
   * The prefix for the tab and panel IDs. Spread {@link getTabPanelProps} onto the active panel
   * so each tab is linked to its panel.
   */
  id: string
  getHref?: never
  prefetchTabs?: never
}

/**
 * Props for the {@link Tabs} component. Pass `getHref` for link navigation or `onTabChange` for
 * buttons, but not both.
 */
export type TabsProps<TValue extends string> = TabsLinkProps<TValue> | TabsButtonProps<TValue>

const getTabId = (id: string, tab: string) => `${id}-tab-${tab}`

const getTabPanelId = (id: string, tab: string) => `${id}-panel-${tab}`

/**
 * Gets the props that link a tab panel to its tab in button mode. Spread them onto the panel.
 *
 * @param id The `id` given to {@link Tabs}.
 * @param tab The value of the tab that the panel belongs to.
 * @returns The panel's `id`, `role` and `aria-labelledby`.
 */
export const getTabPanelProps = (id: string, tab: string) => ({
  id: getTabPanelId(id, tab),
  role: "tabpanel",
  "aria-labelledby": getTabId(id, tab),
})

/**
 * A row of tabs for switching between views. Tabs render as links when `getHref` is given, or as
 * buttons in a tablist when `onTabChange` is.
 *
 * @param tabs The tabs in the order they appear.
 * @param activeTab The value of the current tab.
 * @param getHref Builds the URL for a tab. Mutually exclusive with `onTabChange`.
 * @param onTabChange Called with the selected tab. Mutually exclusive with `getHref`.
 * @param id The prefix for the tab and panel IDs. Button mode only.
 * @param prefetchTabs Fully prefetch the other tabs. Link mode only.
 * @returns A navigation landmark of links, or a tablist of buttons.
 */
export const Tabs = <TValue extends string>({
  tabs,
  activeTab,
  getHref,
  prefetchTabs,
  onTabChange,
  id,
  "aria-label": ariaLabel,
  className,
}: TabsProps<TValue>) => {
  const { list, tab: tabClass } = tabsVariants()

  if (getHref) {
    return (
      <nav aria-label={ariaLabel} className={className}>
        <ul className={list()}>
          {tabs.map(({ value, label, disabledReason }) => {
            const active = value === activeTab

            return (
              <li key={value}>
                {disabledReason ? (
                  <span
                    aria-disabled="true"
                    className={tabClass({ disabled: true })}
                    title={disabledReason}
                  >
                    {label}
                    <span className="sr-only"> ({disabledReason.toLowerCase()})</span>
                  </span>
                ) : (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={tabClass({ active })}
                    href={getHref(value)}
                    // Undefined keeps the default prefetch
                    prefetch={(prefetchTabs && !active) || undefined}
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <div aria-label={ariaLabel} className={cn(list(), className)} role="tablist">
      {tabs.map(({ value, label, disabledReason }) => {
        const active = value === activeTab

        return (
          <button
            aria-controls={getTabPanelId(id, value)}
            aria-selected={active}
            className={tabClass({ active, disabled: Boolean(disabledReason) })}
            disabled={Boolean(disabledReason)}
            id={getTabId(id, value)}
            key={value}
            onClick={() => onTabChange(value)}
            role="tab"
            title={disabledReason}
            type="button"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
