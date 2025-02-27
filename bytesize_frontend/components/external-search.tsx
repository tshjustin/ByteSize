"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaperCard } from "@/components/paper-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { type CategoryType } from "@/lib/categories"
import { type Paper } from "@/hooks/use-saved-papers"
import { searchPapers } from "@/lib/api"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export function ExternalSearch() {
  const [query, setQuery] = React.useState("")
  const [searchOption, setSearchOption] = React.useState("title")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<Paper[]>([])
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 500)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 3) {
        setResults([])
        return
      }

      setIsSearching(true)
      setError(null)
      
      try {
        console.log(`Searching for: "${debouncedQuery}" by ${searchOption}`);
        const papers = await searchPapers(searchOption, debouncedQuery)
        console.log(`Search results:`, papers);
        setResults(papers)
      } catch (error) {
        console.error('Search error:', error)
        setError("Failed to complete search. Please try again.")
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery, searchOption])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length < 3) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      const papers = await searchPapers(searchOption, query)
      setResults(papers)
    } catch (error) {
      console.error('Manual search error:', error)
      setError("Failed to complete search. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <motion.div 
      className="w-full"
      layout
    >
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Select
            value={searchOption}
            onValueChange={setSearchOption}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-grow group">
            <Input
              ref={inputRef}
              placeholder={`Search by ${searchOption}...`}
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
          <Button 
            type="submit" 
            variant="default"
            className="flex-shrink-0"
            disabled={query.length < 3 || isSearching}
          >
            Search
          </Button>
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
                  type="button"
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
        </form>

        <AnimatePresence>
          {(isSearching || results.length > 0 || error) && (
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
              {error && (
                <motion.div 
                  className="text-center text-destructive py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}
              
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
                <div className="space-y-2">
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
                  
                  <div className="divide-y">
                    <AnimatePresence mode="popLayout">
                      {results.slice(0, isExpanded ? undefined : 5).map((paper, index) => (
                        <motion.div
                          key={paper.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="py-2"
                        >
                          <a 
                            href={paper.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block hover:bg-accent/50 p-2 rounded transition-colors"
                          >
                            <div className="font-medium">{paper.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {paper.pdfUrl}
                            </div>
                          </a>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
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