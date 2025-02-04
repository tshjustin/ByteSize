import React, { useState, useEffect } from "react";
import PaperCard from "./PaperCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Category } from "@/constants/categories";

interface SavedPaper {
  id: string;
  title: string;
  abstract: string;
  date: string;
  isHot?: boolean;
  citations?: number;
  author?: string;
  categories?: Category[];
}

export default function SavedPapers() {
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const papersPerPage = 6;

  useEffect(() => {
    // Function to load saved papers
    const loadSavedPapers = () => {
      const papers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
      setSavedPapers(papers);
    };

    // Custom event handler for real-time updates
    const handleSavedPapersUpdate = (event: CustomEvent<{ papers: SavedPaper[] }>) => {
      setSavedPapers(event.detail.papers);
    };

    // Load initial data
    loadSavedPapers();

    // Listen for storage changes in other tabs
    window.addEventListener('storage', loadSavedPapers);
    
    // Listen for custom event for same-tab updates
    window.addEventListener('savedPapersUpdate', handleSavedPapersUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', loadSavedPapers);
      window.removeEventListener('savedPapersUpdate', handleSavedPapersUpdate as EventListener);
    };
  }, []);

  // Adjust current page if we remove papers and current page becomes invalid
  useEffect(() => {
    const maxPage = Math.ceil(savedPapers.length / papersPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [savedPapers.length, currentPage, papersPerPage]);

  // Calculate pagination
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = savedPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(savedPapers.length / papersPerPage);

  return (
    <div>
      {savedPapers.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>You haven't saved any papers yet.</p>
          <p className="mt-2">Click the bookmark icon on any paper.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {savedPapers.length} saved paper{savedPapers.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentPapers.map((paper) => (
              <PaperCard 
                key={paper.id} 
                {...paper}
                author={paper.author || "Research Team"}
                categories={paper.categories}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}