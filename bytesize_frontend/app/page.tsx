"use client"

import { useState, useRef, useEffect } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaginationControls } from "@/components/pagination-controls"
import { CategorySearch } from "@/components/category-search"
import { ExternalSearch } from "@/components/external-search"
import { type CategoryType } from "@/lib/categories"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { generatePaperContextId } from "@/lib/utils"
import { fetchRecentPapers } from "@/lib/api"
import { Paper } from "@/hooks/use-saved-papers"
import { AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 9

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([])
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    async function loadPapers() {
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await fetchRecentPapers()
        setPapers(data)
      } catch (err) {
        console.error("Failed to fetch papers:", err)
        setError("Failed to load papers. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPapers()
  }, [])

  const filteredPapers = papers.filter(paper => 
    selectedCategories.length === 0 || 
    selectedCategories.every(category => 
      paper.categories.includes(category)
    )
  )

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPapers = filteredPapers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE)

  const handleSelectCategory = (category: CategoryType) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
    setCurrentPage(1)
  }

  const handleClearCategories = () => {
    setSelectedCategories([])
    setCurrentPage(1)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Paper card skeleton loading state
  const LoadingSkeleton = () => (
    <>
      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <div key={index} className="rounded-md border border-border p-6 h-[420px] flex flex-col space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full flex-grow" />
          <div className="flex justify-between pt-4 border-t mt-auto">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </>
  )

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />
      <div className="max-w-[1400px] mx-auto px-4 py-8" ref={containerRef}>
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Recent Papers
        </motion.h1>
        <motion.div 
          className="space-y-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ExternalSearch />
          <Separator />
          <CategorySearch
            selectedCategories={selectedCategories}
            onSelectCategory={handleSelectCategory}
            onClearCategories={handleClearCategories}
          />
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div 
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {currentPapers.map((paper) => {
                // Create a new paper object with context-specific ID
                const contextPaper = {
                  ...paper,
                  id: generatePaperContextId(paper.id, 'recent')
                };
                
                return (
                  <motion.div
                    key={contextPaper.id}
                    variants={item}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <PaperCard paper={contextPaper} />
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>

        {!isLoading && filteredPapers.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg text-muted-foreground">
              No papers found matching the selected categories.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </div>
    </>
  )
}