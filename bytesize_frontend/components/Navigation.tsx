"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollText, TrendingUp, Bookmark, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Navigation() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const routes = [
    {
      href: "/",
      label: "Recent",
      icon: ScrollText,
    },
    {
      href: "/highly-cited",
      label: "Highly Cited",
      icon: TrendingUp,
    },
    {
      href: "/saved",
      label: "Saved",
      icon: Bookmark,
    },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              ByteSize
            </Link>
            <div className="hidden md:flex space-x-1">
              {routes.map((route) => {
                const Icon = route.icon
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === route.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {route.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}