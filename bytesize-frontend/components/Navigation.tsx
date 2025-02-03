"use client"

import { Button } from "@/components/ui/button"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className="mb-10 flex space-x-2">
      <Button variant={activeTab === "recent" ? "default" : "outline"} onClick={() => setActiveTab("recent")}>
        Home
      </Button>
      <Button
        variant={activeTab === "breakthroughs" ? "default" : "outline"}
        onClick={() => setActiveTab("breakthroughs")}
      >
        Breakthroughs
      </Button>
      <Button variant={activeTab === "saved" ? "default" : "outline"} onClick={() => setActiveTab("saved")}>
        Saved
      </Button>
    </nav>
  )
}

