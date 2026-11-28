"use client"

import { motion } from "motion/react"

/**
 * The bar under the active tab in the {@link Tabs} component. All bars in one `Tabs` use the same
 * `layoutId`, so the bar slides to the new tab when the active tab changes. This is a separate
 * client component so that `Tabs` can stay a server component and take function props such as
 * `getHref`.
 */
export const TabIndicator = ({ layoutId, className }: { layoutId: string; className: string }) => (
  <motion.span
    aria-hidden="true"
    className={className}
    layoutId={layoutId}
    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
  />
)
