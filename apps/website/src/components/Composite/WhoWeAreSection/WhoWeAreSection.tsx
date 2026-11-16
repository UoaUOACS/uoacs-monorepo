"use client"

import { Heading, Section } from "@uoacs/ui"
import { useEffect, useRef, useState } from "react"
import { Polaroid } from "@/components/Generic"
import type { Polaroid as PolaroidType } from "@/payload/payload-types"

/**
 * Props for the {@link WhoWeAreSection} component
 */
export interface WhoWeAreSectionProps {
  /**
   *
   */
  polaroids: PolaroidType[]
}

const POLAROID_PRESETS = [
  { x: 0, y: 0, rotation: 0 },
  { x: 180, y: 40, rotation: 15 },
  { x: 320, y: 80, rotation: 45 },
]

// Base dimensions for the polaroid layout (at scale 1)
const BASE_WIDTH = 564 // 320 + 244 (max x_offset + polaroid width)
const BASE_HEIGHT = 410 // 80 + 330 (max y_offset + polaroid height)

/**
 * A section component that introduces who we are with text and polaroid images
 *
 * @param polaroids An array of polaroid objects to display in the section
 */
export const WhoWeAreSection = ({ polaroids }: WhoWeAreSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        setScale(Math.min(1, containerWidth / (1.1 * BASE_WIDTH)))
      }
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [])

  return (
    <Section
      subtitle="We're a community built around computer science. From technical workshops and industry events to competitions, academic support and social experiences, UOACS gives students opportunities to learn, build, connect and grow."
      title="Who We Are"
    >
      <div className="flex w-full flex-wrap justify-center gap-12">
        <div className="flex w-full max-w-md flex-col gap-4 md:w-auto">
          <div className="bg-accent-purple-light flex min-h-36 flex-col gap-2 p-4">
            <Heading className="justify-start text-left" h={3}>
              Technical Development
            </Heading>
            <p>
              Hands-on workshops, hackathons and technical events that help students develop
              practical skills beyond the classroom.
            </p>
          </div>
          <div className="bg-accent-red-light flex min-h-36 flex-col gap-2 p-4">
            <Heading className="justify-start text-left" h={3}>
              Industry &amp; Careers
            </Heading>
            <p>
              Connecting students with leading technology companies and professionals through talks,
              panels, networking and career opportunities.
            </p>
          </div>
          <div className="bg-accent-yellow-light flex min-h-36 flex-col gap-2 p-4">
            <Heading className="justify-start text-left" h={3}>
              Community
            </Heading>
            <p>
              Bringing Auckland's Computer Science community together through collaborations,
              competitions and social experiences.
            </p>
          </div>
        </div>

        <div
          className="w-full max-w-xl flex-1"
          ref={containerRef}
          style={{ height: BASE_HEIGHT * scale }}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              transform: `scale(${scale})`,
            }}
          >
            {polaroids.map((polaroid, index) => {
              const photo = polaroid.image
              let src: string | undefined

              if (!photo) {
                src = undefined
              } else if (typeof photo === "string") {
                src = photo
              } else if (typeof photo === "object" && photo !== null) {
                src = photo.url ?? photo.thumbnailURL ?? undefined
              }

              if (!src) return null

              const preset = POLAROID_PRESETS[index % POLAROID_PRESETS.length]

              return (
                <Polaroid
                  key={polaroid.id}
                  rotation={preset.rotation}
                  text={polaroid.caption}
                  url={src}
                  xOffset={preset.x}
                  yOffset={preset.y}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Section>
  )
}
