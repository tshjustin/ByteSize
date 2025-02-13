"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
}

export default function HotPapers() {
  const [hotPapers, setHotPapers] = useState<Paper[]>([])

  useEffect(() => {
    async function fetchHotPapers() {
      const response = await fetch("/api/hot-papers")
      const data = await response.json()
      setHotPapers(data)
    }
    fetchHotPapers()
  }, [])

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Hot Papers (Last 30 Days)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hotPapers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  )
}

