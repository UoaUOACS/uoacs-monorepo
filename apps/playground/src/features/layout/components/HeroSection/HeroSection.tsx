import { Button, Heading } from "@uoacs/ui"
import Image from "next/image"
import Link from "next/link"
import { Routes } from "@/lib/routes"

export const HeroSection = () => {
  return (
    <div className="mx-auto flex w-full max-w-full flex-col items-center justify-center gap-0 px-2 pt-4 text-left md:gap-0 md:px-0 md:pt-8 lg:flex-row">
      <div className="z-10 flex w-min max-w-full flex-col items-start gap-3 md:gap-6">
        <div className="flex w-max max-w-full flex-col items-start justify-start font-cartograph whitespace-nowrap sm:flex-row sm:gap-2">
          <Heading className="pr-6 font-cartograph font-bold tracking-[-10%]" h={2}>
            Project
          </Heading>
          <Heading className="font-cartograph font-bold tracking-[-10%] text-primary" h={2} period>
            Playground
          </Heading>
        </div>

        <p className="flex items-baseline gap-2 text-left text-sm text-pretty text-secondary md:text-xl">
          <span className="shrink-0 font-semibold text-primary">/*</span>
          <span className="flex-1">
            {" "}
            A space to showcase student projects, creativity, and innovation. Explore what our
            students have created and get inspired!{" "}
            <span className="font-semibold text-primary">*/</span>
          </span>
        </p>

        <div className="flex w-max max-w-full flex-row items-center justify-center gap-2 whitespace-nowrap">
          <Link href={Routes.PROJECTS.CREATE}>
            <Button
              className="whitespace-nowrap"
              font="cartograph"
              shape="pill"
              size="md"
              tabIndex={-1}
              theme="primary-dark"
            >
              Start Creating Now!
            </Button>
          </Link>

          <Link href={Routes.SEARCH}>
            <Button
              className="whitespace-nowrap"
              font="cartograph"
              shape="pill"
              size="md"
              tabIndex={-1}
              theme="primary-dark"
            >
              Browse
            </Button>
          </Link>
        </div>

        <div className="hidden h-1.5 w-full bg-linear-to-r from-[#FF307C] to-[#2134FF] mask-[linear-gradient(to_right,white,transparent)] md:block" />

        <div className="flex flex-col items-start justify-start gap-4 md:w-full">
          <a
            className="group text-base text-black underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-300 hover:text-secondary hover:decoration-current md:text-xl"
            href={process.env.NEXT_PUBLIC_WEBSITE_URL}
          >
            Return to the{" "}
            <span className="font-bold text-primary transition-colors duration-300 group-hover:text-primary/50">
              UOACS
            </span>{" "}
            website
          </a>
        </div>
      </div>

      <div className="pointer-events-none relative hidden h-120 w-70 shrink-0 lg:flex">
        <Image alt="" className="object-contain" fill src="/hero-gradient-assets.png" />
      </div>
    </div>
  )
}
