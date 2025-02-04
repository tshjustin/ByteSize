import React, { useState, useEffect } from "react";
import PaperCard from "./PaperCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TagFilter from "./TagFilter";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  date: string;
  isHot: boolean;
  author?: string;
  categories?: string[];
}

export default function RecentPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const papersPerPage = 6;

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/papers");
      const data = await response.json();
      // Adding mock categories to the fetched data
      const enrichedData = data.map(paper => ({
        ...paper,
        categories: paper.isHot 
          ? ["AI", "Machine Learning", "Neural Networks"]
          : ["Data Science", "Statistics", "Python"]
      }));
      setPapers(enrichedData);
    }
    fetchPapers();
  }, []);

  // Get trending papers (unfiltered)
  const trendingPapers = papers
    .filter(paper => paper.isHot)
    .slice(0, 3);

  // Filter only recent papers based on selected tags
  const filteredRecentPapers = papers
    .filter(paper => !paper.isHot)
    .filter(paper => {
      if (selectedTags.length === 0) return true;
      return paper.categories?.some(category => selectedTags.includes(category));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate pagination for recent papers
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredRecentPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(filteredRecentPapers.length / papersPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags]);

  return (
    <div>
      <TagFilter onFilterChange={setSelectedTags} />
      
      {/* Trending section - always visible */}
      <h2 className="text-2xl font-semibold mb-4">Trending</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {trendingPapers.map((paper) => (
          <PaperCard 
            key={paper.id} 
            {...paper} 
            author="Research Team"
            categories={paper.categories}
          />
        ))}
      </div>

      {/* Recent papers section - filtered based on tags */}
      <h2 className="text-2xl font-semibold mb-4">Recent</h2>
      {currentPapers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentPapers.map((paper) => (
              <PaperCard 
                key={paper.id} 
                {...paper}
                author="Research Team"
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
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No recent papers found matching the selected tags.
        </div>
      )}
    </div>
  );
}