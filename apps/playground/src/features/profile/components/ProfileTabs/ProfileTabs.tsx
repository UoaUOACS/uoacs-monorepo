"use client"

import { getTabPanelProps, Tabs } from "@uoacs/ui"
import { type ReactNode, useId, useState } from "react"
import { PROFILE_TABS, type ProfileTab } from "@/features/profile/profile.constants"

const TAB_OPTIONS = PROFILE_TABS.map((tab) => ({ value: tab, label: tab }))

interface ProfileTabsProps {
  /**
   * The content of each tab. Pass `null` or an `EmptyState` for a tab with nothing to show.
   */
  panels: Record<ProfileTab, ReactNode>
}

export const ProfileTabs = ({ panels }: ProfileTabsProps) => {
  const tabsId = useId()
  const [selected, setSelected] = useState<ProfileTab>(PROFILE_TABS[0])

  return (
    <div className="flex w-full flex-col gap-8">
      <Tabs activeTab={selected} id={tabsId} onTabChange={setSelected} tabs={TAB_OPTIONS} />
      <div aria-hidden="true" className="h-px bg-linear-to-r from-pink-300 to-blue-400" />
      <section {...getTabPanelProps(tabsId, selected)}>{panels[selected]}</section>
    </div>
  )
}
