"use client"

import { type ReactNode, useState } from "react"
import { editProfileTab } from "./EditProfileTabs.variants"

export type EditProfileTab = {
  id: string
  label: string
  content: ReactNode
}

export type EditProfileTabsProps = {
  tabs: EditProfileTab[]
  defaultTabId?: string
}

export function EditProfileTabs({ tabs, defaultTabId }: EditProfileTabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id)

  return (
    <div className="mt-12 flex flex-col gap-6 md:flex-row md:gap-12">
      <div
        aria-orientation="vertical"
        className="flex shrink-0 gap-4 md:w-40 md:flex-col md:gap-3"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              className={editProfileTab({ active: isActive })}
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="max-w-3xl min-w-0 flex-1">
        {tabs.map((tab) => (
          <div
            aria-labelledby={`tab-${tab.id}`}
            className="flex flex-col gap-4"
            hidden={tab.id !== activeId}
            id={`panel-${tab.id}`}
            key={tab.id}
            role="tabpanel"
          >
            <p className="font-mono text-sm tracking-wide uppercase">
              <span className="text-pink-500">&#47;/</span> {tab.label}
            </p>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
