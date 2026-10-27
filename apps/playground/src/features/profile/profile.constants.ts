export const PROFILE_TABS = ["Projects", "About"] as const

export type ProfileTab = (typeof PROFILE_TABS)[number]
