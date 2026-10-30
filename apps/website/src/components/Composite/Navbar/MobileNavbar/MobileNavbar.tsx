"use client"

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { ArrowLeftEndOnRectangleIcon, ArrowRightIcon } from "@heroicons/react/24/solid"
import { AuthPages, authPageUrl } from "@uoacs/shared"
import { BorderButton, Button, Heading, SocialIcon } from "@uoacs/ui"
import { cn } from "@uoacs/ui/utils"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import Link, { type LinkProps } from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "@/context/SessionContext"
import { logOut } from "@/lib/auth/log-out"
import { Routes, websiteUrl } from "@/lib/routes"

import type { NavbarProps } from "../Navbar"
import { mobileNavbarVariants } from "./variants"

/**
 * A mobile navbar component that displays a logo, navigation links, social media icons, and a join button.
 *
 * @param links Links to be displayed in the mobile navbar.
 * @param socialLinks Social links to be displayed in the mobile navbar.
 */
export const MobileNavbar = ({ links, socialLinks }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const session = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const extendedLinks = [...links, { label: "Profile", href: Routes.PROFILE }]

  const handleLogout = async () => {
    setIsOpen(false)
    await logOut(router)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    document.documentElement.classList.add("overflow-hidden", "touch-none")
    document.body.classList.add("touch-none")

    return () => {
      document.documentElement.classList.remove("overflow-hidden", "touch-none")
      document.body.classList.remove("touch-none")
    }
  }, [isOpen])

  return (
    <>
      <div className="md:hidden">
        <AnimatePresence>
          {!isOpen && (
            <motion.div layoutId="navbar-button">
              <BorderButton
                borderClassName="z-50 md:hidden"
                onClick={() => setIsOpen(true)}
                variant={{ size: "sm", theme: "primary", border: true }}
              >
                {/* TODO: make something less janky */}
                <Bars3Icon className="h-6 w-6 origin-center scale-110 stroke-[2.5]" />
              </BorderButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className={cn("md:hidden", mobileNavbarVariants({ isOpen }))}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className="flex w-full flex-row items-center justify-between px-4">
              <motion.div layoutId="navbar-logo">
                <Link href={Routes.HOME} onClick={() => setIsOpen(false)}>
                  <Image alt="UOACS Logo" height={40} src="/uoacs-logo-bw.svg" width={167} />
                </Link>
              </motion.div>
              <motion.div layoutId="navbar-button">
                <BorderButton
                  borderClassName="z-50"
                  onClick={() => setIsOpen(!isOpen)}
                  variant={{ size: "sm", theme: "primary", border: true }}
                >
                  {/* TODO: make something less janky */}
                  <XMarkIcon className="h-6 w-6 origin-center scale-110 stroke-[2.5]" />
                </BorderButton>
              </motion.div>
            </div>
            <div className="w-full">
              {extendedLinks.map((link) => (
                <MobileNavbarButton key={link.href} {...link} onClick={() => setIsOpen(false)} />
              ))}
            </div>
            <div className="flex w-fit flex-row gap-6 text-2xl text-gray-700">
              {socialLinks.map((link) => (
                <a href={link.href} key={link.href} rel="noopener noreferrer" target="_blank">
                  <SocialIcon className="h-6 w-6" icon={link.icon} />
                </a>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              {session ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Button
                    className="flex flex-row items-center gap-2"
                    onClick={handleLogout}
                    theme="dark"
                  >
                    <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
                    <p>Log Out</p>
                  </Button>
                </div>
              ) : (
                <a
                  className="grid grid-cols-4"
                  href={authPageUrl(AuthPages.LOGIN, websiteUrl(pathname))}
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="col-span-4 rounded-b-none" theme="dark">
                    Log In <ArrowRightIcon className="h-3 w-3" />
                  </Button>
                  <div className="h-0.5 w-full rounded-bl-xs bg-orange-400" />
                  <div className="h-0.5 w-full bg-blue-400" />
                  <div className="h-0.5 w-full bg-purple-400" />
                  <div className="h-0.5 w-full rounded-br-xs bg-pink-400" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * A button component for the mobile navbar.
 *
 * @param label The label of the button.
 * @param props Additional LinkProps to be passed to the Link component.
 */
export const MobileNavbarButton = ({ label, ...props }: { label: string } & LinkProps) => {
  const gradientVariants = {
    initial: {
      scale: 1,
      opacity: 0.5,
      background: "linear-gradient(0deg, #FF9961, #F27F76, #C861A7, #8A40E7)",
    },
    hover: {
      scale: 1.2,
      opacity: 1,
      background: "linear-gradient(0deg, #FF307C, #FB76A7)",
    },
  }

  return (
    <motion.div animate="animate" initial="initial" whileHover="hover">
      <Link
        className="relative flex w-full flex-row items-center justify-between overflow-hidden border border-orange-50 p-6"
        {...props}
      >
        <Heading className="text-left" h={2}>
          {label}
        </Heading>
        <div className="h-8 w-8 rounded-full bg-linear-to-bl from-pink-500 to-pink-400" />
        <motion.div
          className="absolute -bottom-3 left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-full blur-3xl"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          variants={gradientVariants}
        />
      </Link>
    </motion.div>
  )
}
