import { Button, Heading } from "@uoacs/ui"
import Image from "next/image"
import Link from "next/link"
import { Routes } from "@/lib/routes"

export function NotFoundContent() {
  return (
    <div className="flex grow flex-col items-center justify-center gap-8 px-4 py-16 md:flex-row md:gap-16">
      <div className="flex flex-col items-center gap-2 text-center md:grid md:grid-cols-[auto_1fr] md:items-start md:gap-x-3 md:text-left">
        <div className="flex items-center gap-3 md:contents">
          <span aria-hidden className="heading-1 text-5xl text-primary italic md:text-7xl">
            &#47;&#47;
          </span>
          <Heading className="font-medium text-5xl md:justify-start md:text-7xl" h={1}>
            404 Error
          </Heading>
        </div>
        <p className="paragraph max-w-100 text-pretty font-light md:col-start-2">
          Sorry we couldn&apos;t find the page you were looking for
        </p>
        <Link className="mt-6 md:col-start-2" href={Routes.HOME}>
          <Button className="md:h-16.75 md:px-7.5" shape="pill" size="md" theme="dark">
            Go Home
          </Button>
        </Link>
      </div>
      <Image
        alt=""
        className="size-48 md:size-64"
        height={256}
        priority
        src="/sad-mascot.png"
        width={256}
      />
    </div>
  )
}
