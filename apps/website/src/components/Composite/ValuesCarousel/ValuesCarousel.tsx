"use client"

import { useState } from "react"
import { ValueCard, type ValueCardProps, ValuesFingerprint } from "@/components/Generic"

interface Value {
  title: string
  colour: ValueCardProps["colour"]
  content: React.ReactNode
}

/**
 * @deprecated Use ValuesAccordion instead.
 */
export const ValuesCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const values: Value[] = [
    {
      title: "Collaborate",
      colour: "orange",
      content: (
        <>
          <p>
            The best ideas rarely come from working alone. When diverse perspectives come together,
            innovation happens.
          </p>
          <p>
            We cultivate an environment where students can team up on projects, share knowledge, and
            learn from one another's unique experiences.
          </p>
          <p>
            Whether with faculty, industry partners, or fellow students, collaboration is at our
            core.
          </p>
        </>
      ),
    },
    {
      title: "Network",
      colour: "pink",
      content: (
        <>
          <p>
            The people you meet now can shape your entire career. Building relationships early opens
            doors you didn't know existed.
          </p>
          <p>
            We host events where you can engage directly with industry professionals, alumni, and
            peers who share your interests.
          </p>
          <p>
            These connections often lead to internships, job opportunities, and mentorships that
            extend well beyond university.
          </p>
        </>
      ),
    },
    {
      title: "Connect",
      colour: "purple",
      content: (
        <>
          <p>
            Computer science can sometimes feel like a solitary pursuit, but it doesn't have to be
            that way.
          </p>
          <p>
            Our events are designed to help you meet others who share similar experiences, from
            navigating coursework to preparing for the job market.
          </p>
          <p>
            The friendships you form here often become your support system throughout your studies
            and beyond.
          </p>
        </>
      ),
    },
    {
      title: "Develop",
      colour: "blue",
      content: (
        <>
          <p>
            University provides the theory, but there's often a gap between academic knowledge and
            practical skills .
          </p>
          <p>
            We bridge that gap through workshops, hackathons, and other events covering everything
            from version control to system design to interview preparation.
          </p>
          <p>Grow your technical abilities alongside others who are on the same journey.</p>
        </>
      ),
    },
  ]

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? values.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === values.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-12 px-4 [@media(min-width:1200px)]:flex-row [@media(min-width:1200px)]:items-center [@media(min-width:1200px)]:justify-center [@media(min-width:1200px)]:gap-38 [@media(min-width:1200px)]:px-10">
      <div className="flex flex-col items-center gap-4 pr-8 [@media(min-width:1200px)]:gap-8 [@media(min-width:1200px)]:pr-0">
        <div className="flex scale-60 gap-36 md:scale-100">
          <button
            aria-label="Select Collaborate value"
            className="cursor-pointer"
            onClick={() => setActiveIndex(0)}
            type="button"
          >
            <ValuesFingerprint label="Collaborate" variant={{ colour: "orange", size: "md" }} />
          </button>
          <button
            aria-label="Select Network value"
            className="cursor-pointer"
            onClick={() => setActiveIndex(1)}
            type="button"
          >
            <ValuesFingerprint label="Network" variant={{ colour: "pink", size: "md" }} />
          </button>
        </div>
        <div className="flex scale-60 gap-36 md:scale-100">
          <button
            aria-label="Select Connect value"
            className="cursor-pointer"
            onClick={() => setActiveIndex(2)}
            type="button"
          >
            <ValuesFingerprint label="Connect" variant={{ colour: "purple", size: "md" }} />
          </button>
          <button
            aria-label="Select Develop value"
            className="cursor-pointer"
            onClick={() => setActiveIndex(3)}
            type="button"
          >
            <ValuesFingerprint label="Develop" variant={{ colour: "blue", size: "md" }} />
          </button>
        </div>
      </div>
      <div className="relative flex w-full justify-center [@media(min-width:1200px)]:w-auto [@media(min-width:1200px)]:justify-start">
        <div className="relative inline-block">
          <ValueCard colour={values[activeIndex].colour} title={values[activeIndex].title}>
            <div className="flex flex-col gap-8">{values[activeIndex].content}</div>
          </ValueCard>

          {/* Navigation buttons */}
          <div className="absolute -right-3 -bottom-3 z-10 flex gap-0 rounded border border-gray-400 bg-white">
            <button
              aria-label="Previous value"
              className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-gray-400"
              onClick={handlePrevious}
              type="button"
            >
              <div className="h-0 w-0 border-t-6 border-r-8 border-b-6 border-t-transparent border-r-black border-b-transparent" />
            </button>
            <button
              aria-label="Next value"
              className="flex h-8 w-8 cursor-pointer items-center justify-center"
              onClick={handleNext}
              type="button"
            >
              <div className="h-0 w-0 border-t-6 border-b-6 border-l-8 border-t-transparent border-b-transparent border-l-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
