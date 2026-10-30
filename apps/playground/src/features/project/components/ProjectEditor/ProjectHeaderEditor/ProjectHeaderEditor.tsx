"use client"

import { uploadProjectMedia } from "@/features/project/actions/uploadProjectMedia"
import { projectCardVariants } from "@/features/project/components/ProjectCard/ProjectCard.variants"
import { projectFormOptions } from "@/features/project/editor/projectForm.options"
import {
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
  MEDIA_UPLOAD_MAX_DIMENSION,
  PROJECT_SUMMARY_MAX_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "@/features/project/project.constants"
import { withForm } from "@/lib/form/useAppForm"

const { base, content } = projectCardVariants({ variant: "profile" })

/**
 * The project's cover image, title and summary, laid out like the profile `ProjectCard`
 */
export const ProjectHeaderEditor = withForm({
  ...projectFormOptions,
  props: {
    /**
     * The saved cover image, shown until a new one is picked
     */
    coverImageURL: undefined as string | undefined,
  },
  render: ({ form, coverImageURL }) => (
    <div className={base({ className: "border border-gray-200" })}>
      <form.AppField name="coverImage">
        {(field) => (
          <field.ImageUploadField
            containerClassName="md:w-64 md:shrink-0 md:self-start lg:w-100"
            label="Add a cover image"
            maxBytes={MEDIA_MAX_BYTES}
            maxDimension={MEDIA_UPLOAD_MAX_DIMENSION}
            required
            src={coverImageURL}
            types={MEDIA_TYPES}
            upload={uploadProjectMedia}
          />
        )}
      </form.AppField>
      <div className={content({ className: "md:justify-center" })}>
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              className="heading-4 font-inter font-bold"
              label="Title"
              maxLength={PROJECT_TITLE_MAX_LENGTH}
              placeholder="My project"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="summary">
          {(field) => (
            <field.TextAreaField
              className="font-switzer text-pretty text-gray-600"
              label="Summary"
              maxLength={PROJECT_SUMMARY_MAX_LENGTH}
              placeholder="What it is, in a sentence or two"
              required
              resize="none"
            />
          )}
        </form.AppField>
      </div>
    </div>
  ),
})
