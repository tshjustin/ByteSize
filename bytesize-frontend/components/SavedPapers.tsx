import React, { useState, useEffect, useMemo } from "react";
import Fuse from 'fuse.js';
import PaperCard from "./PaperCard";
import SearchBar from "./SearchBar";
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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => new Fuse(savedPapers, {
    keys: ['title', 'abstract'],
    threshold: 0.3,
    includeScore: true
  }), [savedPapers]);

  // Filter papers based on search query
  const filteredPapers = useMemo(() => {
    if (!searchQuery) return savedPapers;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, savedPapers, fuse]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);

  if (savedPapers.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>You haven't saved any papers yet.</p>
        <p className="mt-2">Click the bookmark icon on any paper to save it for later.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Saved Papers</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {savedPapers.length} saved paper{savedPapers.length !== 1 ? 's' : ''}
          </div>
        </div>

        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Search saved papers..."
          className="w-full"
        />
      </div>

      {filteredPapers.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No saved papers match your search.
        </div>
      ) : (
        <>
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