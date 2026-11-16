"use client"

import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { userAdditionalFields } from "./user-fields"

/**
 * The one Better Auth client every app uses.
 *
 * Shared so the website and playground talk to the same auth service and see
 * the same session; creating a client per app would let their base URLs drift.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [inferAdditionalFields({ user: userAdditionalFields })],
})
