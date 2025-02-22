"use client"

import { useState, useRef } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaginationControls } from "@/components/pagination-controls"
import { CategorySearch } from "@/components/category-search"
import { ExternalSearch } from "@/components/external-search"
import { type CategoryType } from "@/lib/categories"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { generatePaperContextId } from "@/lib/utils"

const recentPapers = [
  {
    id: "1",
    title: "Advances in Quantum Computing: A New Paradigm",
    authors: ["Jane Smith", "John Doe"],
    categories: ["Neural Networks", "Computer Vision", "MLOps"] as CategoryType[], 
    abstract: "This paper explores recent breakthroughs in quantum computing, including advancements in quantum error correction, quantum circuit optimization, and the development of new quantum algorithms. The research demonstrates significant improvements in quantum coherence times and gate fidelities.",
    publishedDate: "2024-03-20",
    detailedSummary: "This comprehensive study delves into the latest advancements in quantum computing, focusing on three key areas: error correction, circuit optimization, and algorithm development. The research team achieved a 50% reduction in decoherence rates through novel error correction techniques and demonstrated a 3x improvement in quantum circuit efficiency. The paper also introduces a new quantum algorithm for molecular simulation that outperforms classical methods by an order of magnitude.",
    laymanSummary: "Imagine computers that can solve complex problems millions of times faster than today's machines. This research shows how we're making quantum computers more reliable and efficient, similar to how we improved early classical computers. The team found ways to reduce errors, make the systems run more smoothly, and solve problems more efficiently. These improvements bring us closer to practical quantum computers that could revolutionize fields like drug discovery and climate modeling.",
    pdfUrl: "https://example.com/quantum-computing-paper.pdf"
  },
  {
    id: "2",
    title: "Machine Learning in Healthcare: Predictive Analytics",
    authors: ["Alice Johnson", "Bob Wilson"],
    categories: ["LLM", "Ethics"] as CategoryType[],
    abstract: "An examination of machine learning applications in healthcare, focusing on early disease detection, patient outcome prediction, and personalized treatment recommendations. The study presents novel approaches to handling medical data privacy and bias mitigation in healthcare AI systems.",
    publishedDate: "2024-03-19",
    detailedSummary: "This research paper presents a comprehensive framework for implementing machine learning in healthcare settings while maintaining patient privacy and ensuring ethical use of data. The study demonstrates a 40% improvement in early disease detection rates and a 25% increase in treatment efficacy through personalized recommendations. The researchers also developed new techniques for identifying and mitigating bias in healthcare AI systems.",
    laymanSummary: "This study shows how artificial intelligence can help doctors make better decisions about patient care while keeping patient information private and ensuring fair treatment for everyone. The AI system can spot diseases earlier than traditional methods and suggest treatments that work better for each patient. The researchers also found ways to make sure the AI treats all patients fairly, regardless of their background.",
    pdfUrl: "https://example.com/healthcare-ml-paper.pdf"
  },
  {
    id: "3",
    title: "Sustainable Energy Solutions for Urban Development",
    authors: ["Maria Garcia", "David Chen"],
    categories: ["Finetuning", "NLP"] as CategoryType[],
    abstract: "Investigating renewable energy implementation in cities, with a focus on smart grid integration, energy storage solutions, and demand response systems. The research provides comprehensive analysis of urban energy consumption patterns and optimization strategies.",
    publishedDate: "2024-03-18",
    detailedSummary: "The paper presents a detailed analysis of renewable energy integration in urban environments, showcasing successful implementations across five major cities. Key findings include a 30% reduction in peak energy demand through smart grid systems and a 45% improvement in energy storage efficiency. The research also provides a framework for optimizing energy distribution based on real-time consumption patterns.",
    laymanSummary: "Cities use a lot of energy, and this research shows how we can make them more environmentally friendly using renewable energy sources like solar and wind power. The team developed smart systems that can store energy more efficiently and distribute it based on when people need it most. These improvements could lead to cleaner cities with lower energy bills for residents.",
    pdfUrl: "https://example.com/sustainable-energy-paper.pdf"
  }
]

const ITEMS_PER_PAGE = 9

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const filteredPapers = recentPapers.filter(paper => 
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
        <motion.div 
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {currentPapers.map((paper, index) => {
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
        </motion.div>
        {filteredPapers.length === 0 ? (
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