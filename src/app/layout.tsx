import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://urpeer.com'

export const metadata: Metadata = {
  title: {
    default: "Urpeer - Feedback Platform",
    template: "%s | Urpeer",
  },
  description: "Centralized feedback platform for SaaS products. Collect user feedback, manage roadmaps, and share changelogs.",
  keywords: ["feedback", "roadmap", "changelog", "saas", "product management", "feature requests"],
  authors: [{ name: "Urpeer Team" }],
  creator: "Urpeer",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Urpeer - Feedback Platform",
    description: "Centralized feedback platform for SaaS products. Collect user feedback, manage roadmaps, and share changelogs.",
    siteName: "Urpeer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urpeer - Feedback Platform",
    description: "Centralized feedback platform for SaaS products.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
