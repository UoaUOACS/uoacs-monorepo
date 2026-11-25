"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { ArrowLeftEndOnRectangleIcon, ArrowUpRightIcon, UserIcon } from "@heroicons/react/24/solid"
import { AuthPages } from "@uoacs/shared"
import { authClient } from "@uoacs/shared/auth"
import type { DropdownProps } from "@uoacs/ui"
import { Button, Dropdown } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Routes } from "@/lib/routes"
import { AuthPageLink } from "../AuthPageLink/AuthPageLink"

/**
 * Props for the {@link PlaygroundNavbar} component.
 */
export interface PlaygroundNavbarProps {
  /**
   * Auth-state override, used by branch unit tests and the Storybook sandbox to
   * force the auth state even when no session is loaded. Omitted in production.
   */
  signedIn?: boolean
  /**
   * Route the logo links to.
   */
  logoHref?: string
}

/**
 * A responsive navbar for the playground, with logo, page title, and auth action
 * driven by the auth session.
 *
 * @param signedIn Optional session-state override for story/unit tests.
 * @param logoHref Route the logo links to.
 * @returns A Navbar component with logo, tagline, and auth action.
 */
export function PlaygroundNavbar({
  signedIn: signedInOverride,
  logoHref = Routes.HOME,
}: PlaygroundNavbarProps) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const signedIn = signedInOverride ?? Boolean(session)
  const navRef = useRef<HTMLElement>(null)
  const [contentBelow, setContentBelow] = useState(false)

  // Shows the shadow only once page content scrolls under the navbar, not over the white space above it
  useEffect(() => {
    const update = () => {
      const nav = navRef.current
      const contentTop = firstContentTop(document.querySelector("main"))
      setContentBelow(
        nav !== null && contentTop !== null && contentTop < nav.getBoundingClientRect().bottom,
      )
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const profileOptions: DropdownProps["options"] = [
    {
      href: Routes.PROFILE.ROOT,
      label: (
        <div className="flex flex-row items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <p>Profile</p>
        </div>
      ),
      theme: "dark",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-2">
          <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
          <p>Log Out</p>
        </div>
      ),
      onClick: async () => {
        await authClient.signOut()
        router.refresh()
      },
      theme: "dark",
    },
  ]

  return (
    // Above sticky page bars, like the editor toolbar, so the profile menu opens over them
    <nav
      className={cn(
        "sticky top-0 z-50 flex w-full flex-row items-center justify-between bg-white px-6 py-6 transition-shadow md:px-16",
        contentBelow && "shadow-md",
      )}
      ref={navRef}
    >
      <Link className="flex flex-row items-center gap-3" href={logoHref}>
        <Image alt="UOACS Logo" height={40} src="/uoacs-logo-black.svg" width={167} />
      </Link>

      {/* While the session resolves, nothing renders in the auth slot so a signed-in user never flashes the signed-out view. */}
      {/* An explicit signedIn override (storybook/tests) renders immediately, since the sandbox has no session to wait on. */}
      {isPending && signedInOverride === undefined ? null : signedIn ? (
        <div className="flex flex-row items-center gap-3">
          <Link href={Routes.PROJECTS.CREATE}>
            <Button left={<PlusIcon className="size-4" />} size="md" tabIndex={-1} theme="ghost">
              <span className="text-base">Create</span>
            </Button>
          </Link>
          <Dropdown
            label={<UserIcon className="size-6" />}
            options={profileOptions}
            size="icon"
            theme="dark"
            trigger={false}
          />
        </div>
      ) : (
        <div className="flex flex-row items-center gap-3">
          <AuthPageLink className="inline-flex" page={AuthPages.LOGIN}>
            <Button tabIndex={-1} theme="ghost">
              Log In
            </Button>
          </AuthPageLink>
          <AuthPageLink className="md:inline-flex" page={AuthPages.SIGN_UP}>
            <Button
              right={<ArrowUpRightIcon className="h-4 w-4 md:h-6 md:w-6" />}
              tabIndex={-1}
              theme="primary"
            >
              Sign Up
            </Button>
          </AuthPageLink>
        </div>
      )}
    </nav>
  )
}

/** Elements that show content even with no text inside them. */
const MEDIA_ELEMENTS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "INPUT"])

/**
 * Finds the top edge of the first visible text or media in an element, skipping the
 * empty padding and margins above it.
 *
 * @param root The element to search, usually the page's `<main>`.
 * @returns The viewport top of the first visible content, or null if there is none.
 */
function firstContentTop(root: Element | null) {
  if (!root) return null

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    let rect: DOMRect
    if (node instanceof Text) {
      if (node.data.trim() === "") continue
      // Text nodes have no box of their own, so measure the text with a range
      const range = document.createRange()
      range.selectNodeContents(node)
      rect = range.getBoundingClientRect()
    } else if (node instanceof Element && MEDIA_ELEMENTS.has(node.nodeName.toUpperCase())) {
      rect = node.getBoundingClientRect()
    } else {
      continue
    }

    // Hidden content (e.g. `hidden md:block`) has no size, so keep looking
    if (rect.height > 0) return rect.top
  }
  return null
}
