import { getDiscordWidgetData } from "@uoacs/shared"
import { cn } from "@uoacs/ui/utils"
import localFont from "next/font/local"
import type React from "react"
import { Footer, Navbar } from "@/components/Composite"
import "../globals.css"
import { getSession } from "@uoacs/shared/auth/server"
import type { Metadata, Viewport } from "next"
import { getSocialLinks } from "@/lib/helpers"
import { ApiRoutes, Routes } from "@/lib/routes"
import { Providers } from "./providers"

const inter = localFont({
  src: "../../../../../packages/ui/src/styles/fonts/InterTight-Variable.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "optional",
})

const switzer = localFont({
  src: "../../../../../packages/ui/src/styles/fonts/Switzer-Variable.woff2",
  weight: "100 900",
  variable: "--font-switzer",
  display: "optional",
})

const mono = localFont({
  src: [
    {
      path: "../../../../../packages/ui/src/styles/fonts/IBMPlexMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../../packages/ui/src/styles/fonts/IBMPlexMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000"),
  description: "University of Auckland Computer Society - Join our community of CS students!",
  title: {
    default: "UOACS",
    template: "%s - UOACS",
  },
  openGraph: {
    siteName: "UOACS",
    type: "website",
    locale: "en_NZ",
    images: [
      {
        url: ApiRoutes.OG,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [ApiRoutes.OG],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const navbarLinks: { label: string; href: string }[] = [
  { label: "Home", href: Routes.HOME },
  { label: "Meet The Team", href: Routes.TEAM },
  { label: "Our Sponsors", href: Routes.SPONSORS },
  { label: "Events", href: Routes.EVENTS },
]

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const [socialLinks, sessionResult, discordWidgetData] = await Promise.all([
    getSocialLinks(),
    getSession(),
    getDiscordWidgetData(),
  ])

  return (
    <html
      className={cn(inter.variable, switzer.variable, mono.variable, "overflow-x-hidden")}
      lang="en"
    >
      <body className="relative flex min-h-screen flex-col overflow-hidden">
        <Providers initialSession={sessionResult}>
          <div className="mx-auto flex w-full max-w-370 grow flex-col px-4 py-6 md:gap-9 md:px-12 lg:px-20">
            <Navbar links={navbarLinks} socialLinks={socialLinks} />
            <main className="flex grow flex-col items-center gap-14 py-9 md:gap-30">
              {children}
            </main>
          </div>
          <Footer
            discordWidgetData={discordWidgetData}
            links={navbarLinks}
            socialLinks={socialLinks}
          />
        </Providers>
      </body>
    </html>
  )
}
