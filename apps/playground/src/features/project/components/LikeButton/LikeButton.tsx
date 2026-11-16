"use client"

import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"
import { useDebouncedCallback } from "@tanstack/react-pacer"
import { AuthPages, authPageUrl } from "@uoacs/shared"
import { AnimatedSuspense, Button } from "@uoacs/ui"
import { toast } from "@uoacs/ui/toast"
import { cn } from "@uoacs/ui/utils"
import { usePathname } from "next/navigation"
import { use, useLayoutEffect, useRef, useState } from "react"
import { setLike } from "@/features/project/actions/setLike"
import { formatLikes } from "@/features/project/helpers/format"
import { projectsUrl } from "@/lib/routes"

interface LikeState {
  isLiked: boolean
  likes: number
}

const withLiked = (state: LikeState, liked: boolean): LikeState =>
  state.isLiked === liked ? state : { isLiked: liked, likes: state.likes + (liked ? 1 : -1) }

interface LikeButtonProps {
  projectID: string
  likes: number
  isLiked?: boolean | Promise<boolean>
  className?: string
  iconClassName?: string
  countClassName?: string
}

interface LikeButtonContentProps extends LikeButtonProps {
  isLiked?: boolean
  /** Liked state is still loading, so a click can't know what to toggle */
  pending?: boolean
}

const StreamedLikeButton = ({
  isLiked,
  ...props
}: LikeButtonProps & { isLiked: Promise<boolean> }) => (
  <LikeButtonContent {...props} isLiked={use(isLiked)} />
)

export const LikeButton = ({ isLiked, ...props }: LikeButtonProps) =>
  typeof isLiked === "object" ? (
    <AnimatedSuspense fallback={<LikeButtonContent {...props} pending />}>
      <StreamedLikeButton {...props} isLiked={isLiked} />
    </AnimatedSuspense>
  ) : (
    <LikeButtonContent {...props} isLiked={isLiked} />
  )

const LikeButtonContent = ({
  projectID,
  likes,
  isLiked = false,
  className,
  iconClassName,
  countClassName,
  pending,
}: LikeButtonContentProps) => {
  // Saved results update the button without waiting for new props
  const [saved, setSaved] = useState({ isLiked, likes })
  // Set only while a click is not saved yet
  const [wantedState, setWantedState] = useState<boolean | null>(null)
  // Next.js keeps a page's state when you navigate away and back, so start again from the server's
  // state when the page shows again or the props change. A key would remount and lose focus
  useLayoutEffect(() => {
    setSaved((state) =>
      state.isLiked === isLiked && state.likes === likes ? state : { isLiked, likes },
    )
  }, [isLiked, likes])
  const shown = wantedState === null ? saved : withLiked(saved, wantedState)
  const heartRef = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()

  const send = async (liked: boolean) => {
    const settle = () => setWantedState((current) => (current === liked ? null : current))

    try {
      const result = await setLike(projectID, liked)
      settle()
      if (result.ok) {
        setSaved((state) => withLiked(state, result.liked))
        return
      }
      if (result.reason === "unauthenticated") {
        const loginHref = authPageUrl(AuthPages.LOGIN, projectsUrl(pathname))
        toast.error({
          description: result.error,
          action: (
            <a href={loginHref}>
              <Button size="sm">Log In</Button>
            </a>
          ),
        })
        return
      }
      console.error("[LikeButton] like was not saved", { error: result.error })
      toast.error({ description: result.error })
    } catch (err) {
      settle()
      console.error("[LikeButton] like request failed", { error: err })
      toast.error({ description: "Something went wrong. Try again." })
    }
  }

  const save = useDebouncedCallback((liked: boolean) => void send(liked), {
    wait: 400,
    onUnmount: (debouncer) => debouncer.flush(),
  })

  const handleClick = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heartRef.current?.animate([{ scale: 1 }, { scale: 0.8 }, { scale: 1.2 }, { scale: 1 }], {
        duration: 400,
        easing: "ease-out",
      })
    }
    const liked = !shown.isLiked
    setWantedState(liked)
    save(liked)
  }

  return (
    <button
      aria-busy={pending || undefined}
      aria-label={shown.isLiked ? "Unlike project" : "Like project"}
      aria-pressed={shown.isLiked}
      className={cn("group/like cursor-pointer disabled:cursor-default", className)}
      disabled={pending}
      onClick={handleClick}
      type="button"
    >
      <span
        aria-hidden="true"
        className="block transition-transform duration-200 group-hover/like:scale-110"
      >
        <span className="grid" ref={heartRef}>
          <HeartOutlineIcon
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-200",
              iconClassName,
              shown.isLiked && "opacity-0",
            )}
          />
          <HeartSolidIcon
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-200",
              iconClassName,
              "text-red-500",
              !shown.isLiked && "opacity-0",
            )}
          />
        </span>
      </span>
      <span className={countClassName}>{formatLikes(shown.likes)}</span>
    </button>
  )
}
