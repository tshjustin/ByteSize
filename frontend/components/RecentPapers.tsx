"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
  isHot: boolean
}

export default function RecentPapers() {
  const [papers, setPapers] = useState<Paper[]>([])

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/papers")
      const data = await response.json()
      setPapers(data)
    }
    fetchPapers()
  }, [])

  const hotPapers = papers.filter((paper) => paper.isHot).slice(0, 3)
  const recentPapers = papers
    .filter((paper) => !paper.isHot)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Hot Papers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {hotPapers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Recent Papers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPapers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  )
}

