"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
}

export default function SavedPapers() {
  const [papers, setPapers] = useState<Paper[]>([])

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/saved-papers")
      const data = await response.json()
      setPapers(data)
    }
    fetchPapers()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Saved Papers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  )
}

