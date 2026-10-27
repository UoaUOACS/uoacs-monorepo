import { Button, Heading } from "@uoacs/ui"
import Form from "next/form"
import Link from "next/link"
import { SearchBar } from "@/features/search/components/SearchBar/SearchBar"
import { Routes } from "@/lib/routes"

export const HeroSection = () => {
  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center gap-10 px-2 pt-16 text-center md:w-fit md:gap-20 md:px-0 md:pt-32">
      <div className="flex w-min max-w-full flex-col items-center gap-3 md:gap-6">
        <div className="flex w-max max-w-full flex-col items-center justify-center whitespace-nowrap font-neulis sm:flex-row sm:gap-2">
          <Heading className="font-bold font-neulis" h={2}>
            Project
          </Heading>
          <Heading className="font-bold font-neulis text-primary" h={2}>
            Playground
          </Heading>
        </div>

        <p className="text-pretty text-center text-secondary text-sm md:text-xl">
          <span className="font-semibold text-primary">/*</span> A space to showcase student
          projects, creativity, and innovation. Explore what our students have created and get
          inspired! <span className="font-semibold text-primary">*/</span>
        </p>
      </div>

      <Link href={Routes.PROJECTS.CREATE}>
        <Button
          className="whitespace-nowrap"
          font="cartograph"
          shape="rounded"
          size="md"
          tabIndex={-1}
          theme="primary-dark"
        >
          Start Creating Now!
        </Button>
      </Link>

      <div className="flex flex-col items-center justify-center gap-4 md:w-full">
        <a
          className="group text-base text-black underline decoration-1 decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-secondary hover:decoration-current md:text-xl"
          href={process.env.NEXT_PUBLIC_WEBSITE_URL}
        >
          Return to{" "}
          <span className="font-bold text-primary transition-colors duration-300 group-hover:text-primary/50">
            UOACS
          </span>{" "}
          website
        </a>

        <Form action={Routes.SEARCH} className="w-full">
          <SearchBar name="q" />
        </Form>
      </div>
    </div>
  )
}
