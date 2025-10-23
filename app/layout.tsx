import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { PurchasedLandsProvider } from "@/contexts/purchased-lands-context"
import { ThirdwebProviderWrapper } from "@/components/thirdweb-provider"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "DhartiLink — UPI for Land Ownership",
  description:
    "DhartiLink brings trust, speed, and accessibility to land ownership with blockchain proofs, geospatial mapping, and open digital bidding.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} holo-theme antialiased`}
        suppressHydrationWarning={true}
      >
        <ThirdwebProviderWrapper>
          <PurchasedLandsProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </PurchasedLandsProvider>
        </ThirdwebProviderWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
