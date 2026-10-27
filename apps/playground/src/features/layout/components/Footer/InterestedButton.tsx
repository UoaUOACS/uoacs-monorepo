import { ArrowUpRightIcon } from "@heroicons/react/24/solid"
import { AuthPages } from "@uoacs/shared"
import { Button } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { AuthPageLink } from "../AuthPageLink/AuthPageLink"

export const InterestedButton = ({ className }: { className?: string }) => (
  <AuthPageLink page={AuthPages.SIGN_UP}>
    <Button
      className={cn("whitespace-nowrap", className)}
      right={<ArrowUpRightIcon className="h-4 w-4 text-white" />}
      theme="primary"
    >
      Interested? Join UOACS
    </Button>
  </AuthPageLink>
)
