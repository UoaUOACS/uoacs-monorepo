import type { Preview } from "@storybook/nextjs-vite"
import { sb } from "storybook/test"
import "../src/app/globals.css"
import "@uoacs/ui/styles/fonts.css"

// The real actions import Payload, which cannot run in the browser
sb.mock(import("../src/features/project/actions/setLike.ts"))
sb.mock(import("../src/features/project/actions/saveProject.ts"))
sb.mock(import("../src/features/project/actions/uploadProjectMedia.ts"))
sb.mock(import("../src/features/project/actions/deleteProject.ts"))
sb.mock(import("../src/features/member/actions/editMember.ts"))

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
