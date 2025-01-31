"use client"

import { useState } from "react"
import Navigation from "@/components/Navigation"
import RecentPapers from "@/components/RecentPapers"
import BreakthroughPapers from "@/components/BreakthroughPapers"
import SavedPapers from "@/components/SavedPapers"

export default function Home() {
  const [activeTab, setActiveTab] = useState("recent")

  return (
    <main className="container mx-auto px-4 py-8">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "recent" && <RecentPapers />}
      {activeTab === "breakthroughs" && <BreakthroughPapers />}
      {activeTab === "saved" && <SavedPapers />}
    </main>
  )
}

