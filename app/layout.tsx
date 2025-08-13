import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import PWAProvider from "@/components/PWAProvider"
import "../styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "RunFrame Core - Execution OS",
  description: "A seductive execution operating system",
  manifest: "/manifest.json",
  themeColor: "#7000FF",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7000FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} bg-neutral-950 text-white font-sans antialiased`}>
        <PWAProvider>
          <div className="flex min-h-screen">
            <div className="relative z-10 flex-1">{children}</div>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1A1A1A",
                color: "#fff",
                border: "1px solid rgba(112, 0, 255, 0.2)",
              },
              success: {
                iconTheme: {
                  primary: "#7000FF",
                  secondary: "#fff",
                },
              },
            }}
          />
        </PWAProvider>
      </body>
    </html>
  )
}
