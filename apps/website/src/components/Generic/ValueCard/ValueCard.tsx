import { Heading } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"

/**
 * Props for the ValueCard component.
 */
export interface ValueCardProps {
  /**
   * The title of the value card.
   */
  title: string
  /**
   * The colour variant of the value card border.
   */
  colour: "pink" | "orange" | "purple" | "blue"
  /**
   * The content of the value card.
   * Should provide minimal structure, as the ValueCard component handles most styling.
   */
  children: React.ReactNode
}

const borderColourClasses: Record<ValueCardProps["colour"], string> = {
  purple: "border-brand-purple",
  blue: "border-brand-blue",
  orange: "border-brand-orange",
  pink: "border-brand-pink",
}

/**
 * A card component to display a value with a title and content.
 * For use in the Values section of the homepage.
 *
 * @param title The title of the value card.
 * @param colour The colour variant of the value card border.
 * @param children The content of the value card. Should provide minimal structure, as the ValueCard component handles most styling.
 * @returns A card component to display a value with a title and content.
 * @example
 * ```tsx
 * <ValueCard title="Collaborate" colour="purple">
 *   <p>Line 1</p>
 *   <p>Line 2</p>
 * </ValueCard>
 * ```
 * @deprecated Use ValuesAccordion instead.
 */
export const ValueCard = ({ title, colour, children }: ValueCardProps) => {
  return (
    <div
      className={cn(
        "flex w-full max-w-75 flex-col border-6 md:max-w-132",
        borderColourClasses[colour],
      )}
    >
      <Heading className="!justify-start border-b-1 border-b-gray-300 p-3 !text-left" h={4}>
        {title}
      </Heading>
      <div className="px-3 py-6 font-switzer text-xl leading-none font-light">{children}</div>
    </div>
  )
}
