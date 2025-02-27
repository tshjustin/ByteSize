"use client"

import { useState, useEffect } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaginationControls } from "@/components/pagination-controls"
import { CategorySearch } from "@/components/category-search"
import { type CategoryType } from "@/lib/categories"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, AlertCircle } from "lucide-react"
import { generatePaperContextId } from "@/lib/utils" 
import { fetchHighlyCitedPapers } from "@/lib/api"
import { Paper } from "@/hooks/use-saved-papers"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = "citations" | "date"

const ITEMS_PER_PAGE = 9

export default function HighlyCited() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("citations")
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        const data = await fetchHighlyCitedPapers()
        setPapers(data)
      } catch (err) {
        console.error("Failed to fetch highly cited papers:", err)
        setError("Failed to load papers. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPapers()
  }, [])

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

  const handleSort = (option: SortOption) => {
    setSortBy(option)
    setCurrentPage(1)
  }

  const filteredAndSortedPapers = papers
    .filter(paper => 
      selectedCategories.length === 0 || 
      selectedCategories.every(category => 
        paper.categories.includes(category)
      )
    )
    .sort((a, b) => {
      if (sortBy === "citations") {
        return (b.citations || 0) - (a.citations || 0)
      }
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    })

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPapers = filteredAndSortedPapers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedPapers.length / ITEMS_PER_PAGE)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
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
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Highly Cited Papers
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Sort by {sortBy === "citations" ? "Citations" : "Date"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("citations")}>
                  Sort by Citations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("date")}>
                  Sort by Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
            <AnimatePresence mode="popLayout">
              {currentPapers.map((paper) => {
                // Create a new paper object with context-specific ID
                const contextPaper = {
                  ...paper,
                  id: generatePaperContextId(paper.id, 'highly-cited')
                };
                
                return (
                  <motion.div
                    key={contextPaper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    <PaperCard paper={contextPaper} showCitations />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>

        {!isLoading && filteredAndSortedPapers.length === 0 ? (
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
          !isLoading && filteredAndSortedPapers.length > ITEMS_PER_PAGE && (
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
          )
        )}
      </div>
    </>
  )
}