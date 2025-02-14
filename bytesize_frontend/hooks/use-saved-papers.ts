"use client"

import { useEffect, useState } from "react"
import { type CategoryType } from "@/lib/categories"

export interface Paper {
  id: string
  title: string
  authors: string[]
  categories: CategoryType[]
  abstract: string
  citations?: number
  publishedDate: string
  detailedSummary?: string
  laymanSummary?: string
  pdfUrl?: string
}

export function useSavedPapers() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("savedPapers")
    if (saved) {
      setSavedPapers(JSON.parse(saved))
    }
  }, [])

  const savePaper = (paper: Paper) => {
    setSavedPapers(prev => {
      const newSavedPapers = [...prev, paper]
      localStorage.setItem("savedPapers", JSON.stringify(newSavedPapers))
      return newSavedPapers
    })
  }

  const removePaper = (paperId: string) => {
    setSavedPapers(prev => {
      const newSavedPapers = prev.filter((paper) => paper.id !== paperId)
      localStorage.setItem("savedPapers", JSON.stringify(newSavedPapers))
      return newSavedPapers
    })
  }

  const isPaperSaved = (paperId: string) => {
    return savedPapers.some((paper) => paper.id === paperId)
  }

  return {
    savedPapers,
    savePaper,
    removePaper,
    isPaperSaved,
  }
}