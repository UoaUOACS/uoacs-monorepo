"use client"

import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline"
import { Button } from "@uoacs/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Routes } from "@/lib/routes"
import type { Member } from "@/payload/payload-types"

interface ProfileHeaderButtonProps {
  /**
   * The profile owner's username, for the link back to their profile.
   */
  username: Member["username"]
}

/**
 * The profile owner's button: "edit profile" on their profile, or "return to profile" on the edit
 * page.
 */
export const ProfileHeaderButton = ({ username }: ProfileHeaderButtonProps) => {
  const isEditing = usePathname() === Routes.PROFILE.EDIT

  return (
    <Link href={isEditing ? Routes.PROFILE.USERNAME(username) : Routes.PROFILE.EDIT}>
      <Button
        left={isEditing ? <ArrowLeftIcon className="size-4" /> : <PencilIcon className="size-4" />}
        shape="rounded"
        theme="dark"
      >
        {isEditing ? "return to profile" : "edit profile"}
      </Button>
    </Link>
  )
}
