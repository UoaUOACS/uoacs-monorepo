import { LazyImage } from "@uoacs/ui"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { assertPopulated } from "@/lib/utils"
import type { Event, Media } from "@/payload/payload-types"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

const NZ_TIMEZONE = "Pacific/Auckland"

export interface EventCardProps {
  event: Event
}

export const EventCard = ({ event }: EventCardProps) => {
  assertPopulated<Media>(event.design)

  const isUpcoming = dayjs(event.date).isAfter(dayjs())
  const canRegister = isUpcoming && Boolean(event.signUpForm)

  const eventDate = dayjs(event.date).tz(NZ_TIMEZONE)
  const dateFormat = [
    "MMMM Do",
    ...(isUpcoming ? [] : ["YYYY"]),
    eventDate.minute() === 0 ? "- hA" : "- h:mmA",
  ].join(" ")

  const media = (
    <>
      <LazyImage
        alt={event.design.alt}
        className="rounded-xs object-cover"
        containerClassName="h-full w-full aspect-3/4"
        fill
        src={event.design.url ?? ""}
      />
      {
        canRegister && (
          <>
            <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full bg-gray-600 opacity-0 mix-blend-multiply transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 group-active:opacity-100" />
            <p className="heading-4 pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center font-mono text-white opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 group-active:opacity-100">
              REGISTER
            </p>
          </>
        ) // TODO: add MORE INFO once a per event page has been created
      }
    </>
  )

  return (
    <div className="relative flex w-full max-w-56 flex-col justify-center overflow-hidden rounded-xs shadow-md md:max-w-2xs">
      <div className="group relative">
        {canRegister ? (
          <a
            aria-label={`Register for ${event.name} (opens in new tab)`}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href={event.signUpForm ?? undefined}
            rel="noopener noreferrer"
            target="_blank"
          >
            {media}
          </a>
        ) : (
          media
        )}
      </div>
      <div className="flex flex-col gap-1 p-2 text-center">
        <p className="heading-4 font-mono">{event.name.toUpperCase()}</p>
        <p className="paragraph-xs text-gray-700">{event.description}</p>
        <p className="paragraph-xs font-mono tracking-tight">
          {eventDate.format(dateFormat).toUpperCase()}
        </p>
      </div>
    </div>
  )
}
