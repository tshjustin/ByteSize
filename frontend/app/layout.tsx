import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import ThemeProvider from "@/components/ThemeProvider"
import ThemeToggle from "@/components/ThemeToggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Research Paper Hub",
  description: "A simple platform for browsing and reading research papers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="min-h-screen">
            <header className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Research Paper Hub</h1>
              <ThemeToggle />
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

