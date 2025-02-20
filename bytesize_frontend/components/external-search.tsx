"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaperCard } from "@/components/paper-card"
import { searchExternalPapers, type ExternalPaper } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { type CategoryType } from "@/lib/categories"
import { type Paper } from "@/hooks/use-saved-papers"

// Helper function to convert ExternalPaper to Paper
function convertExternalPaperToPaper(externalPaper: ExternalPaper): Paper {
  return {
    id: externalPaper.id || String(Math.random()), // Fallback if id is missing
    title: externalPaper.title,
    authors: externalPaper.authors,
    categories: externalPaper.categories as CategoryType[],
    abstract: externalPaper.abstract,
    publishedDate: externalPaper.publishedDate,
    detailedSummary: externalPaper.detailedSummary,
    laymanSummary: externalPaper.laymanSummary,
    pdfUrl: externalPaper.url
  }
}

export function ExternalSearch() {
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<ExternalPaper[]>([])
  const [isExpanded, setIsExpanded] = React.useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 3) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const papers = await searchExternalPapers(debouncedQuery)
        setResults(papers)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  return (
    <motion.div 
      className="w-full"
      layout
    >
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-grow group">
            <Input
              ref={inputRef}
              placeholder="Search external papers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "pl-10 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                "group-hover:shadow-md"
              )}
            />
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              "text-muted-foreground transition-colors duration-200",
              "group-hover:text-primary"
            )} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: query.length > 0 ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <AnimatePresence mode="wait">
            {query && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setQuery("")
                    inputRef.current?.focus()
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {(isSearching || results.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "absolute left-0 right-0 top-full mt-2",
                "bg-card/80 backdrop-blur-sm rounded-lg",
                "shadow-lg border p-4 z-50"
              )}
            >
              {isSearching ? (
                <motion.div 
                  className="flex items-center justify-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </motion.div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Found {results.length} papers
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="group"
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                          <ChevronUp className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                        </>
                      ) : (
                        <>
                          Show All
                          <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <motion.div 
                    className="grid gap-4"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {results.slice(0, isExpanded ? undefined : 3).map((paper, index) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          layout
                        >
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex-none transition-colors duration-200",
                                paper.source === "arxiv" 
                                  ? "border-green-500 text-green-700 hover:bg-green-50"
                                  : "border-blue-500 text-blue-700 hover:bg-blue-50"
                              )}
                            >
                              {paper.source === "arxiv" ? "arXiv" : "Semantic Scholar"}
                            </Badge>
                            <PaperCard paper={convertExternalPaperToPaper(paper)} />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ) : query.length >= 3 ? (
                <motion.p 
                  className="text-center text-muted-foreground py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No papers found matching your search.
                </motion.p>
              ) : (
                <motion.p 
                  className="text-center text-muted-foreground py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Type at least 3 characters to search.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}