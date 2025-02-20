"use client"

import { useState } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaginationControls } from "@/components/pagination-controls"
import { CategorySearch } from "@/components/category-search"
import { type CategoryType } from "@/lib/categories"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDownUp } from "lucide-react"
import { generatePaperContextId } from "@/lib/utils"  // Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const highlyCitedPapers = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence",
    authors: ["Sarah Connor", "Miles Dyson"],
    categories: ["LLM", "Ethics", "Neural Networks"] as CategoryType[],
    abstract: "A groundbreaking study on AI development, exploring the implications of advanced artificial intelligence systems on society, ethics, and human-AI interaction. The research presents novel frameworks for ensuring AI safety and alignment with human values.",
    citations: 1250,
    publishedDate: "2024-02-15",
    detailedSummary: "This landmark paper provides a comprehensive analysis of AI development trajectories and their potential impact on society. The research team developed new frameworks for AI safety that achieved a 60% improvement in alignment metrics. The study also presents guidelines for ethical AI development that have been adopted by major tech companies.",
    laymanSummary: "As AI becomes more powerful, we need to make sure it remains safe and beneficial for humanity. This research shows how we can develop AI systems that are both capable and aligned with human values. The team created new ways to make AI systems more reliable and ethical, which are already being used by major technology companies.",
    pdfUrl: "https://example.com/ai-future-paper.pdf"
  },
  {
    id: "2",
    title: "Climate Change: Global Impact Analysis",
    authors: ["Emma Green", "James Blue"],
    categories: ["MLOps", "Computer Vision"] as CategoryType[],
    abstract: "An in-depth analysis of climate change effects on global ecosystems, using advanced computer vision and machine learning techniques to process satellite imagery and environmental data. The study provides crucial insights into climate pattern changes and their implications.",
    citations: 890,
    publishedDate: "2024-02-10",
    detailedSummary: "Using state-of-the-art computer vision techniques, this research analyzed over 50 years of satellite imagery to track climate change impacts. The study identified previously unknown patterns in global temperature variations and developed new models for predicting future climate scenarios with 35% higher accuracy than existing methods.",
    laymanSummary: "By using artificial intelligence to analyze satellite photos from the past 50 years, this research helps us better understand how climate change is affecting our planet. The team discovered new patterns in how temperatures are changing and created better tools for predicting future climate changes. This information is crucial for planning how to address climate change.",
    pdfUrl: "https://example.com/climate-change-paper.pdf"
  },
  {
    id: "3",
    title: "Neuroscience and Consciousness",
    authors: ["Robert Brain", "Lucy Neuron"],
    categories: ["Reinforcement Learning", "NLP", "Finetuning"] as CategoryType[],
    abstract: "Exploring the neural correlates of consciousness through advanced brain imaging and machine learning analysis. This research combines reinforcement learning approaches with natural language processing to understand patterns in neural activity during conscious experiences.",
    citations: 750,
    publishedDate: "2024-02-08",
    detailedSummary: "This pioneering study used machine learning to analyze brain activity patterns during various states of consciousness. The research team identified new neural signatures of conscious experience and developed a novel framework for measuring consciousness levels in clinical settings. The findings have important implications for understanding disorders of consciousness and improving patient care.",
    laymanSummary: "What happens in our brains when we're conscious? This research used artificial intelligence to study brain activity patterns and better understand consciousness. The team found new ways to measure consciousness levels, which could help doctors better treat patients with consciousness disorders, such as those in comas or under anesthesia.",
    pdfUrl: "https://example.com/consciousness-paper.pdf"
  }
]

type SortOption = "citations" | "date"

const ITEMS_PER_PAGE = 9

export default function HighlyCited() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("citations")
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

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

  const filteredAndSortedPapers = highlyCitedPapers
    .filter(paper => 
      selectedCategories.length === 0 || 
      selectedCategories.every(category => 
        paper.categories.includes(category)
      )
    )
    .sort((a, b) => {
      if (sortBy === "citations") {
        return b.citations - a.citations
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
        <motion.div 
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
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
        </motion.div>
        {filteredAndSortedPapers.length === 0 ? (
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
          filteredAndSortedPapers.length > ITEMS_PER_PAGE && (
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