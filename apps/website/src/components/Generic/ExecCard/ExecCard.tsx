import Image from "next/image"
import type { Executive } from "@/payload/payload-types"

export interface ExecCardProps {
  exec: Executive
}

export const ExecCard = ({ exec }: ExecCardProps) => {
  const photo = exec.photo
  let src: string | undefined

  if (!photo) {
    src = undefined
  } else if (typeof photo === "string") {
    src = photo
  } else if (typeof photo === "object" && photo !== null) {
    const maybeMedia = photo as { url?: string | null; thumbnailURL?: string | null }
    src = maybeMedia.url ?? maybeMedia.thumbnailURL ?? undefined
  }

  const photoSquare = (
    <div className="relative h-[6.75rem] w-[6.75rem] overflow-hidden rounded-md md:h-[12.5rem] md:w-[12.5rem]">
      {src ? (
        <Image
          alt={`${exec.name} photo`}
          className="size-full object-cover"
          height={200}
          priority
          src={src}
          width={200}
        />
      ) : (
        <p className="font-md flex aspect-square size-full items-center justify-center bg-gray-200 text-xl text-gray-700">
          {exec.name
            ? exec.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : ""}
        </p>
      )}
    </div>
  )

  const nameAndRole = (
    <div className="flex flex-col items-start gap-1">
      <p className="paragraph">{exec.name}</p>
      {exec.role.title && (
        <p className="paragraph-xs font-medium text-gray-500">{exec.role.title}</p>
      )}
    </div>
  )

  if (exec.linkedin) {
    return (
      <a
        aria-label={`${exec.name} LinkedIn profile`}
        className="group flex w-fit flex-col items-start gap-1 rounded-md p-2 transition-colors duration-300 hover:bg-gray-600-opaque md:gap-2 md:p-3"
        href={exec.linkedin}
        rel="noopener noreferrer"
        target="_blank"
      >
        {photoSquare}
        {nameAndRole}
      </a>
    )
  }

  return (
    <div className="flex w-fit flex-col items-start gap-1 p-2 md:gap-2 md:p-3">
      {photoSquare}
      {nameAndRole}
    </div>
  )
}
