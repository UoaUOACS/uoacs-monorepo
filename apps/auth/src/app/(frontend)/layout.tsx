import { Toaster } from "@uoacs/ui/toast"
import { cn } from "@uoacs/ui/utils"
import type { Metadata } from "next"
import localFont from "next/font/local"
import type React from "react"
import { AuthFooter } from "@/components/AuthFooter/AuthFooter"
import { AuthNavbar } from "@/components/AuthNavbar/AuthNavbar"
import "../globals.css"

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
  title: {
    default: "UOACS",
    template: "%s - UOACS",
  },
  description: "Log in or sign up to the University of Auckland Computer Society.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={cn(inter.variable, switzer.variable, mono.variable, "overflow-x-hidden")}
      lang="en"
    >
      <body className="relative flex min-h-screen flex-col overflow-hidden">
        <Toaster />
        <div className="mx-auto flex w-full max-w-370 grow flex-col px-4 py-6 md:gap-9 md:px-12 lg:px-20">
          <AuthNavbar />
          <main className="flex w-full grow flex-col items-center py-9">{children}</main>
        </div>
        <AuthFooter />
      </body>
    </html>
  )
}
