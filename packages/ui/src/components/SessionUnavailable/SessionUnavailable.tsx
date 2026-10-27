"use client"

import { Button } from "../Button/Button"
import { Heading } from "../Heading/Heading"

/**
 * Shown when the auth service cannot say whether the person is signed in.
 * Retrying reloads the page so both the server and client check again.
 */
export function SessionUnavailable() {
  return (
    <div className="flex grow flex-col items-center justify-center">
      <div className="flex max-w-64 flex-col items-center justify-center gap-6 text-center">
        <div>
          <Heading h={3}>Couldn't confirm your session</Heading>
          <p className="paragraph">We could not reach the login service. Try again in a moment.</p>
        </div>
        <Button onClick={() => window.location.reload()} theme="dark">
          Try Again
        </Button>
      </div>
    </div>
  )
}
