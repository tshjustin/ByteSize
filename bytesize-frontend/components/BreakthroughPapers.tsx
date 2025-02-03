import { useState, useEffect } from "react"
import PaperCard from "./PaperCard"

interface Paper {
  id: string
  title: string
  abstract: string
  date: string
  citations: number
  author?: string
  categories?: string[]
}

export default function BreakthroughPapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const papersPerPage = 6

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/breakthrough-papers")
      const data = await response.json()
      setPapers(data)
    }
    fetchPapers()
  }, [])

  // Pagination logic
  const indexOfLastPaper = currentPage * papersPerPage
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage
  const currentPapers = papers.slice(indexOfFirstPaper, indexOfLastPaper)
  const totalPages = Math.ceil(papers.length / papersPerPage)

  return ( // This would be fetched later on 
    <div>
      <h2 className="text-2xl font-semibold mb-4">Breakthrough Papers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPapers.map((paper) => (
          <PaperCard 
            key={paper.id} 
            {...paper}
            author="Research Team"
            categories={["AI", "Machine Learning", "Neural Networks"]}
            showCitations
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 mb-4">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}