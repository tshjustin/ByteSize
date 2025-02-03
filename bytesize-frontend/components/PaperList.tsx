"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"
import { Flame } from "lucide-react"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
  isHot?: boolean
}

export default function PaperList() {
  const [papers, setPapers] = useState<Paper[]>([])

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/papers")
      const data = await response.json()
      setPapers(data)
    }
    fetchPapers()
  }, [])

  return (
    <div>
      <div className="flex items-center mb-4">
        <Flame className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-sm">Hot papers in the last 30 days</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  )
}

