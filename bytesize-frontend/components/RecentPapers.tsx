"use client"

import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
  isHot: boolean
  author?: string
  categories?: string[]
}

export default function RecentPapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const papersPerPage = 6

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/papers")
      const data = await response.json()
      setPapers(data)
    }
    fetchPapers()
  }, [])

  const hotPapers = papers.filter((paper) => paper.isHot).slice(0, 3)
  const recentPapers = papers.filter((paper) => !paper.isHot)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const indexOfLastPaper = currentPage * papersPerPage
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage
  const currentPapers = recentPapers.slice(indexOfFirstPaper, indexOfLastPaper)
  const totalPages = Math.ceil(recentPapers.length / papersPerPage)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trending</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {hotPapers.map((paper) => (
          <PaperCard 
            key={paper.id} 
            {...paper} 
            author="John Doe"
            categories={["AI", "Machine Learning", "Neural Networks"]}
          />
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Recent</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPapers.map((paper) => (
          <PaperCard 
            key={paper.id} 
            {...paper}
            author="Jane Smith"
            categories={["Data Science", "Statistics", "Python"]}
          />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}