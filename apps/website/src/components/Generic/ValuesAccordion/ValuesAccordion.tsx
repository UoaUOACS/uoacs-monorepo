"use client"

import { useState } from "react"
import type { Value } from "@/types/common"
import { ValuesAccordionItem } from "./ValuesAccordionItem"

/**
 * Props for the ValuesAccordion component
 */
export interface ValuesAccordionProps {
  values: Value[]
}

/**
 * ValuesAccordion component displays an accordion list of values.
 *
 * @param values The list of values to display in the accordion.
 */
export const ValuesAccordion = ({ values }: ValuesAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <div className="w-full max-w-160">
      {values.map((value, index) => (
        <ValuesAccordionItem
          isOpen={openIndex === index}
          key={value.title}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
          value={value}
        />
      ))}
    </div>
  )
}
