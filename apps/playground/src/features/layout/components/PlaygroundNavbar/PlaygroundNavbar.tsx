"use client"

import { ArrowLeftEndOnRectangleIcon, ArrowUpRightIcon, UserIcon } from "@heroicons/react/24/solid"
import { AuthPages } from "@uoacs/shared"
import { authClient } from "@uoacs/shared/auth"
import type { DropdownProps } from "@uoacs/ui"
import { Button, Dropdown } from "@uoacs/ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"
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
    <nav className="relative z-50 flex w-full flex-row items-center justify-between">
      <Link className="flex flex-row items-center gap-3" href={logoHref}>
        <Image alt="UOACS Logo" height={40} src="/uoacs-logo-pink.svg" width={167} />
        <span className="hidden font-bold font-cartograph text-2xl text-gray-400 italic leading-7 md:inline">
          {/* usePathname needs Suspense on dynamic routes */}
          <Suspense fallback={NAVBAR_TITLE}>
            <NavbarTitle />
          </Suspense>
        </span>
      </Link>

      {/* While the session resolves, nothing renders in the auth slot so a signed-in user never flashes the signed-out view. */}
      {/* An explicit signedIn override (storybook/tests) renders immediately, since the sandbox has no session to wait on. */}
      {isPending && signedInOverride === undefined ? null : signedIn ? (
        <Dropdown
          label={<UserIcon className="h-4 w-4" />}
          options={profileOptions}
          theme="dark"
          trigger={false}
        />
      ) : (
        <div className="flex flex-row items-center gap-3">
          <AuthPageLink className="inline-flex" page={AuthPages.LOGIN}>
            <Button tabIndex={-1} theme="ghost">
              Log In
            </Button>
          </AuthPageLink>
          <AuthPageLink className="hidden md:inline-flex" page={AuthPages.SIGN_UP}>
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

const NAVBAR_TITLE = "Project Playground"

const NavbarTitle = () => (usePathname() === Routes.HOME ? "Presents" : NAVBAR_TITLE)
