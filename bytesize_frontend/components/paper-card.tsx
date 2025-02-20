"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, ExternalLink, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useSavedPapers, type Paper } from "@/hooks/use-saved-papers"
import { CATEGORIES } from "@/lib/categories"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

interface PaperCardProps {
  paper: Paper
  showCitations?: boolean
}

export function PaperCard({ paper, showCitations = false }: PaperCardProps) {
  const { isPaperSaved, savePaper, removePaper } = useSavedPapers()
  const isSaved = isPaperSaved(paper.id)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaved) {
      removePaper(paper.id)
    } else {
      savePaper(paper)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={cn(
          "h-[420px] flex flex-col transition-all duration-300 relative",
          isHovered ? "shadow-lg ring-2 ring-primary/10" : "shadow"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="flex-none space-y-3 pb-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold leading-tight flex-grow line-clamp-2 group">
              <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_1px] group-hover:bg-[length:100%_1px] bg-no-repeat bg-left-bottom transition-all duration-500">
                {paper.title}
              </span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveToggle}
                      className={cn(
                        "flex-none transition-all duration-200 relative z-10",
                        isSaved && "text-primary"
                      )}
                    >
                      <Bookmark 
                        className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          isHovered && !isSaved && "translate-y-0.5"
                        )} 
                        fill={isSaved ? "currentColor" : "none"} 
                      />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  {isSaved ? "Remove from saved" : "Save paper"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {paper.categories.slice(0, 3).map((category) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Badge
                    className={cn(
                      "font-medium transition-all duration-200 relative z-10",
                      CATEGORIES[category]?.color || "bg-gray-100 text-gray-800"
                    )}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-4">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {paper.authors.join(", ")}
          </p>
          <p className="text-sm line-clamp-5 leading-relaxed">
            {paper.abstract}
          </p>
        </CardContent>
        <CardFooter className="flex-none flex justify-between items-center pt-4 border-t">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="group relative z-10 hover:bg-primary hover:text-primary-foreground"
              >
                Read More
                <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">
                  {paper.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <AnimatePresence>
                    {paper.categories.map((category, index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge
                          className={cn(
                            "font-medium",
                            CATEGORIES[category]?.color || "bg-gray-100 text-gray-800"
                          )}
                        >
                          {category}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </DialogHeader>
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {paper.laymanSummary && (
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-lg flex items-center">
                      Simple Summary
                      <Badge variant="secondary" className="ml-2">
                        Easy to understand
                      </Badge>
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {paper.laymanSummary}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Authors</h4>
                  <p className="text-sm text-muted-foreground">
                    {paper.authors.join(", ")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-lg">Abstract</h4>
                  <p className="text-sm leading-relaxed">{paper.abstract}</p>
                </div>

                {paper.detailedSummary && (
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Detailed Summary</h4>
                    <p className="text-sm leading-relaxed">{paper.detailedSummary}</p>
                  </div>
                )}

                {showCitations && paper.citations && (
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Impact</h4>
                    <p className="text-sm">
                      This paper has been cited {paper.citations} times
                    </p>
                  </div>
                )}

                {paper.pdfUrl && (
                  <>
                    <Separator />
                    <div className="flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="default"
                                className="group hover:bg-primary/90"
                                onClick={() => window.open(paper.pdfUrl, '_blank')}
                              >
                                <FileText className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                View Full Paper
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Opens in a new tab
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                )}
              </motion.div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center text-sm text-muted-foreground">
            {showCitations && paper.citations && (
              <span className="mr-4">{paper.citations} citations</span>
            )}
            <time dateTime={paper.publishedDate} className="tabular-nums">
              {new Date(paper.publishedDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </time>
          </div>
        </CardFooter>
        
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Card>
    </motion.div>
  )
}