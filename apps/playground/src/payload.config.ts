import path from "node:path"
import { fileURLToPath } from "node:url"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { richTextFeatures } from "@uoacs/shared/payload"
import { buildConfig } from "payload"
import sharp from "sharp"
import { Admin } from "./payload/collections/Admin"
import { Like } from "./payload/collections/Like"
import { Media } from "./payload/collections/Media"
import { Member } from "./payload/collections/Member"
import { Project } from "./payload/collections/Project"
import { ProjectMedia } from "./payload/collections/ProjectMedia"
import { Sponsor } from "./payload/collections/Sponsor"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admin.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: `${path.resolve(dirname)}/app/payload/admin/importMap.js`,
    },
  },
  collections: [Admin, Media, Project, ProjectMedia, Sponsor, Member, Like],
  editor: lexicalEditor({ features: richTextFeatures }),
  graphQL: {
    disable: true,
  },
  routes: {
    admin: "/payload/admin",
    api: "/payload/api",
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload/payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
    // Compare strings case-insensitively, so sorting by name doesn't put lowercase names last
    collation: {
      strength: 2,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: { prefix: "playground/media" },
        projectMedia: { prefix: "playground/project-media" },
      },
      bucket: process.env.S3_BUCKET ?? "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
        region: process.env.S3_REGION,
      },
    }),
  ],
})
