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

// Create a custom event for paper updates
const SAVED_PAPERS_UPDATE = "SAVED_PAPERS_UPDATE"

// Create a custom event type
interface SavedPapersEvent extends Event {
  detail?: { papers: Paper[] }
}

export function useSavedPapers() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([])

  // Load initial data
  useEffect(() => {
    const loadSavedPapers = () => {
      const saved = localStorage.getItem("savedPapers")
      if (saved) {
        setSavedPapers(JSON.parse(saved))
      }
    }

    loadSavedPapers()

    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "savedPapers") {
        loadSavedPapers()
      }
    }

    // Listen for custom events from other components
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as SavedPapersEvent
      if (customEvent.detail?.papers) {
        setSavedPapers(customEvent.detail.papers)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(SAVED_PAPERS_UPDATE, handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(SAVED_PAPERS_UPDATE, handleCustomEvent)
    }
  }, [])

  const broadcastUpdate = (papers: Paper[]) => {
    // Update localStorage
    localStorage.setItem("savedPapers", JSON.stringify(papers))
    
    // Dispatch custom event
    const event = new CustomEvent(SAVED_PAPERS_UPDATE, {
      detail: { papers }
    })
    window.dispatchEvent(event)
  }

  const savePaper = (paper: Paper) => {
    const newSavedPapers = [...savedPapers, paper]
    setSavedPapers(newSavedPapers)
    broadcastUpdate(newSavedPapers)
  }

  const removePaper = (paperId: string) => {
    const newSavedPapers = savedPapers.filter((paper) => paper.id !== paperId)
    setSavedPapers(newSavedPapers)
    broadcastUpdate(newSavedPapers)
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