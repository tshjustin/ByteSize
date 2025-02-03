"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
}

export default function KeyPaperList() {
  const [keyPapers, setKeyPapers] = useState<Paper[]>([])

  useEffect(() => {
    async function fetchKeyPapers() {
      const response = await fetch("/api/key-papers")
      const data = await response.json()
      setKeyPapers(data)
    }
    fetchKeyPapers()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {keyPapers.map((paper) => (
        <PaperCard key={paper.id} {...paper} />
      ))}
    </div>
  )
}

