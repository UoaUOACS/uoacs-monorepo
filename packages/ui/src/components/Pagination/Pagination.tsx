import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { cn } from "../../utils"
import { PageControl } from "./PageControl"
import { getPageItems } from "./Pagination.helpers"
import { paginationVariants } from "./Pagination.variants"

interface PaginationBaseProps {
  /**
   * The current page (1-indexed).
   */
  page: number
  /**
   * The total number of pages. Nothing is rendered when this is less than 1.
   */
  totalPages: number
  /**
   * How many pages to show either side of the current page before collapsing into an ellipsis.
   */
  siblingCount?: number
  /**
   * An accessible name for the navigation landmark. Set this when a page has more than one.
   */
  "aria-label"?: string
  className?: string
}

interface PaginationLinkProps extends PaginationBaseProps {
  /**
   * Builds the URL for a page, rendering each control as a link.
   */
  getHref: (page: number) => string
  /**
   * Fully prefetch the previous and next pages, not just the route's shell. Each prefetch costs a
   * server request, so only enable it when the page data is cached.
   */
  prefetchNeighbours?: boolean
  onPageChange?: never
}

interface PaginationButtonProps extends PaginationBaseProps {
  /**
   * Called with the requested page, rendering each control as a button.
   */
  onPageChange: (page: number) => void
  getHref?: never
  prefetchNeighbours?: never
}

/**
 * Props for the {@link Pagination} component. Pass `getHref` for link navigation or
 * `onPageChange` for buttons, but not both.
 */
export type PaginationProps = PaginationLinkProps | PaginationButtonProps

/**
 * Pagination controls for moving between pages of results, e.g. search results or a grid of
 * cards. Controls render as links when `getHref` is given, or as buttons when `onPageChange` is.
 *
 * @param page The current page (1-indexed).
 * @param totalPages The total number of pages.
 * @param getHref Builds the URL for a page. Mutually exclusive with `onPageChange`.
 * @param onPageChange Called with the requested page. Mutually exclusive with `getHref`.
 * @param siblingCount How many pages to show either side of the current page. Defaults to 1.
 * @param prefetchNeighbours Fully prefetch the previous and next pages. Link mode only.
 * @returns A navigation landmark containing the pagination controls.
 */
export const Pagination = ({
  page,
  totalPages,
  siblingCount = 1,
  getHref,
  onPageChange,
  prefetchNeighbours,
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) => {
  if (totalPages < 1) return null

  const current = Math.min(Math.max(page, 1), totalPages)
  const items = getPageItems(current, totalPages, siblingCount)
  const { root, list, pages, item: itemClass, ellipsis, arrow, arrowIcon } = paginationVariants()
  const mode = { getHref, onPageChange }

  return (
    <nav aria-label={ariaLabel} className={cn(root(), className)}>
      <ul className={list()}>
        <li>
          <PageControl
            {...mode}
            className={arrow({ disabled: current === 1 })}
            disabled={current === 1}
            label="Previous page"
            prefetch={prefetchNeighbours}
            target={current - 1}
          >
            <ChevronLeftIcon aria-hidden="true" className={arrowIcon()} />
          </PageControl>
        </li>
        <li>
          <ul className={pages()}>
            {items.map((item) => (
              <li key={item}>
                {typeof item === "number" ? (
                  <PageControl
                    {...mode}
                    className={itemClass({ current: item === current })}
                    current={item === current}
                    label={`Page ${item}`}
                    target={item}
                  >
                    {item}
                  </PageControl>
                ) : (
                  <span aria-hidden="true" className={ellipsis()}>
                    ...
                  </span>
                )}
              </li>
            ))}
          </ul>
        </li>
        <li>
          <PageControl
            {...mode}
            className={arrow({ disabled: current === totalPages })}
            disabled={current === totalPages}
            label="Next page"
            prefetch={prefetchNeighbours}
            target={current + 1}
          >
            <ChevronRightIcon aria-hidden="true" className={arrowIcon()} />
          </PageControl>
        </li>
      </ul>
    </nav>
  )
}
