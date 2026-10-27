import { SponsorTier } from "@/types/enums"

export const TIER_SIZES: Record<SponsorTier, { height: number; width: number }> = {
  [SponsorTier.DIAMOND]: {
    height: 120,
    width: 320,
  },
  [SponsorTier.GOLD]: { height: 120, width: 320 },
  [SponsorTier.SILVER]: { height: 80, width: 240 },
}
