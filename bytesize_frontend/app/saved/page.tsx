"use client"

import { PaperCard } from "@/components/paper-card"
import { useSavedPapers } from "@/hooks/use-saved-papers"
import { useState } from "react"
import { PaginationControls } from "@/components/pagination-controls"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"

const ITEMS_PER_PAGE = 9

export default function Saved() {
  const { savedPapers } = useSavedPapers()
  const [currentPage, setCurrentPage] = useState(1)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPapers = savedPapers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(savedPapers.length / ITEMS_PER_PAGE)

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
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Saved Papers
        </motion.h1>
        {savedPapers.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg text-muted-foreground">
              You haven't saved any papers yet.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {currentPapers.map((paper) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <PaperCard paper={paper} showCitations />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {savedPapers.length > ITEMS_PER_PAGE && (
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
          </>
        )}
      </div>
    </>
  )
}