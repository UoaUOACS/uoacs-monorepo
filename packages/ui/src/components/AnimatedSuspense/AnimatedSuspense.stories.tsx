import type { Meta, StoryFn } from "@storybook/nextjs-vite"
import { startTransition, use, useState } from "react"
import { Button } from "../Button/Button"
import { Skeleton } from "../Skeleton/Skeleton"
import { AnimatedSuspense } from "./AnimatedSuspense"

const meta: Meta<typeof AnimatedSuspense> = {
  title: "Primitive Components/AnimatedSuspense",
  component: AnimatedSuspense,
}

export default meta
type Story = StoryFn<typeof AnimatedSuspense>

interface ToyExec {
  name: string
  role: string
}

const EXEC: ToyExec = { name: "Benjamin Kee", role: "Loving Kelvin" }

/** Mimics a 2s API call. */
const fetchExec = () =>
  new Promise<ToyExec>((resolve) => {
    setTimeout(() => resolve(EXEC), 2000)
  })

/** A cut-down `ExecCard` from the website app. */
const ExecCard = ({ promise }: { promise: Promise<ToyExec> }) => {
  const exec = use(promise)
  const initials = exec.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  return (
    <div className="flex w-fit flex-col items-start gap-1 p-2 md:gap-2 md:p-3">
      <p className="flex size-27 items-center justify-center rounded-md bg-gray-200 text-xl text-gray-700 md:size-50">
        {initials}
      </p>
      <div className="flex flex-col items-start gap-1">
        <p className="paragraph">{exec.name}</p>
        <p className="paragraph-xs font-medium text-gray-500">{exec.role}</p>
      </div>
    </div>
  )
}

const ExecCardSkeleton = () => (
  <div aria-busy="true" className="flex w-fit flex-col items-start gap-1 p-2 md:gap-2 md:p-3">
    <Skeleton className="size-27 md:size-50" />
    <div className="flex w-full flex-col items-start gap-1">
      <Skeleton className="paragraph w-2/3" shape="text" />
      <Skeleton className="paragraph-xs w-1/2" shape="text" />
    </div>
  </div>
)

/**
 * The skeleton fades out and the card fades in. The animation needs a browser with the
 * View Transitions API; elsewhere the card swaps in with no animation.
 */
export const Default: Story = () => {
  const [count, setCount] = useState(0)
  const [promise, setPromise] = useState(() => fetchExec())

  // A new key remounts the boundary, so it suspends again and shows the fallback.
  const reload = () => {
    startTransition(() => {
      setCount(count + 1)
      setPromise(fetchExec())
    })
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <AnimatedSuspense fallback={<ExecCardSkeleton />} key={count}>
        <ExecCard promise={promise} />
      </AnimatedSuspense>
      <Button onClick={reload} theme="dark">
        Reload
      </Button>
    </div>
  )
}

export const WithoutFallback: Story = () => {
  // Held in state, so a re-render reads the same promise and does not suspend again.
  const [promise] = useState(() => fetchExec())

  return (
    <AnimatedSuspense>
      <ExecCard promise={promise} />
    </AnimatedSuspense>
  )
}
