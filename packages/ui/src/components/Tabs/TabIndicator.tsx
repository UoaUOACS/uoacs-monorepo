"use client"

import { motion } from "motion/react"

/**
 * The bar under the active tab in the {@link Tabs} component. Every tab in one `Tabs` shares the
 * same `layoutId`, so the bar slides to the new tab when the active tab changes. This is a separate
 * client component so that `Tabs` can still take functions such as `getHref` from the server.
 *
 * @param layoutId The layout ID shared by the tabs of one `Tabs` component.
 * @param className Classes for the bar.
 * @returns The animated bar.
 */
export const TabIndicator = ({ layoutId, className }: { layoutId: string; className: string }) => (
  <motion.span
    aria-hidden="true"
    className={className}
    layoutId={layoutId}
    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
  />
)
